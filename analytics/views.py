from datetime import datetime, timedelta

from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.models import User
from django.core.paginator import Paginator
from django.db.models import Count, Q
from django.shortcuts import render
from django.utils import timezone

from .models import Visit, UserActivity


PERSIAN_WEEKDAYS = [
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنج‌شنبه",
    "جمعه",
    "شنبه",
    "یکشنبه",
]


def get_date_range(request):
    """بازه‌ی ساده‌ی داشبورد: امروز، ۷ روز و ۳۰ روز."""
    now = timezone.now()
    today = timezone.localdate()
    range_type = request.GET.get("range", "7d")

    if range_type == "today":
        start = timezone.make_aware(datetime.combine(today, datetime.min.time()))
    elif range_type == "30d":
        start = now - timedelta(days=30)
    else:
        range_type = "7d"
        start = now - timedelta(days=7)

    return start, now, range_type


def paginate(request, queryset, param_name, per_page=20):
    paginator = Paginator(queryset, per_page)
    page_number = request.GET.get(param_name, 1)
    return paginator.get_page(page_number)


def get_percent(value, total):
    if not total:
        return 0
    return round((value / total) * 100)


@staff_member_required
def Admin_Dashboard(request):
    now = timezone.now()
    today = timezone.localdate()
    start, end, selected_range = get_date_range(request)
    
    

    # -------------------------
    # کارت‌های اصلی
    # -------------------------
    total_users = User.objects.count()
    today_visits = Visit.objects.filter(created_at__date=today).count()
    last_7_days = Visit.objects.filter(
        created_at__gte=now - timedelta(days=7)
    ).count()
    new_users_week = User.objects.filter(
        date_joined__gte=now - timedelta(days=7)
    ).count()

    thirty_minutes_ago = now - timedelta(minutes=30)

    active_users = (
        Visit.objects
        .filter(created_at__gte=thirty_minutes_ago, user__isnull=False)
        .values("user")
        .distinct()
        .count()
    )

    active_visitors = (
        Visit.objects
        .filter(created_at__gte=thirty_minutes_ago, user__isnull= True,  ip__isnull=False)
        .exclude(ip="")
        .values("ip")
        .distinct()
        .count()
    )

    active_sessions = (
        Visit.objects
        .filter(created_at__gte=thirty_minutes_ago)
        .select_related("user")
        .order_by("-created_at")[:8]
    )

    # -------------------------
    # بازدیدهای بازه انتخابی
    # -------------------------
    range_visits = Visit.objects.filter(
        created_at__gte=start,
        created_at__lt=end,
    )

    # -------------------------
    # نمودار ۷ روز اخیر
    # -------------------------
    chart_start = today - timedelta(days=6)
    daily_counts = (
        Visit.objects
        .filter(
            created_at__date__gte=chart_start,
            created_at__date__lte=today,
        )
        .values("created_at__date")
        .annotate(total=Count("id"))
        .order_by("created_at__date")
    )

    daily_map = {
        item["created_at__date"]: item["total"]
        for item in daily_counts
    }

    visits_last_7_days = []
    for i in range(7):
        day = chart_start + timedelta(days=i)
        visits_last_7_days.append({
            "date": day,
            "label": PERSIAN_WEEKDAYS[day.weekday()],
            "count": daily_map.get(day, 0),
        })

    max_chart_count = max(
        (item["count"] for item in visits_last_7_days),
        default=1,
    )
    for item in visits_last_7_days:
        item["percentage"] = round(
            (item["count"] / max_chart_count) * 100
        )

    # -------------------------
    # پربازدیدترین صفحات
    # -------------------------
    top_pages = list(
        range_visits
        .values("path")
        .annotate(total=Count("id"))
        .order_by("-total")[:10]
    )
    top_page_max = max((item["total"] for item in top_pages), default=1)
    for item in top_pages:
        item["percentage"] = round((item["total"] / top_page_max) * 100)

    # -------------------------
    # مرورگر، سیستم‌عامل، دستگاه
    # -------------------------
    browsers = (
        range_visits
        .exclude(browser__isnull=True)
        .exclude(browser="")
        .values("browser")
        .annotate(total=Count("id"))
        .order_by("-total")[:8]
    )

    operating_systems = (
        range_visits
        .exclude(os__isnull=True)
        .exclude(os="")
        .values("os")
        .annotate(total=Count("id"))
        .order_by("-total")[:8]
    )

    devices = (
        range_visits
        .exclude(device__isnull=True)
        .exclude(device="")
        .values("device")
        .annotate(total=Count("id"))
        .order_by("-total")[:8]
    )

    tech_total = range_visits.count()
    for item in browsers:
        item["percentage"] = get_percent(item["total"], tech_total)
    for item in operating_systems:
        item["percentage"] = get_percent(item["total"], tech_total)
    for item in devices:
        item["percentage"] = get_percent(item["total"], tech_total)

    # -------------------------
    # جدول بازدیدها + جستجو
    # -------------------------
    visit_search = request.GET.get("visit_q", "").strip()
    traffic_visits = range_visits

    if visit_search:
        traffic_visits = traffic_visits.filter(
            Q(path__icontains=visit_search)
            | Q(ip__icontains=visit_search)
            | Q(user__username__icontains=visit_search)
        )

    traffic_visits = (
        traffic_visits
        .select_related("user")
        .order_by("-created_at")
    )
    traffic_page = paginate(request, traffic_visits, "vpage", 20)

    # -------------------------
    # کاربران + جستجو
    # -------------------------
    user_search = request.GET.get("user_q", "").strip()
    users = User.objects.all()

    if user_search:
        users = users.filter(
            Q(username__icontains=user_search)
            | Q(email__icontains=user_search)
            | Q(visit__ip__icontains=user_search)
        ).distinct()

    users = users.order_by("-date_joined")
    users_page = paginate(request, users, "upage", 20)

    # -------------------------
    # لاگ ورود/خروج
    # -------------------------
    log_search = request.GET.get("log_q", "").strip()
    log_type = request.GET.get("log_type", "all")

    logs = UserActivity.objects.select_related("user").filter(
        created_at__gte=start,
        created_at__lt=end,
    )

    if log_search:
        logs = logs.filter(
            Q(user__username__icontains=log_search)
            | Q(user__email__icontains=log_search)
            | Q(ip__icontains=log_search)
        )

    if log_type in {"login", "logout"}:
        logs = logs.filter(action=log_type)

    logs = logs.order_by("-created_at")
    login_logs = paginate(request, logs, "lpage", 20)

    context = {
        "selected_range": selected_range,
        "total_users": total_users,
        "today_visits": today_visits,
        "last_7_days": last_7_days,
        "new_users_week": new_users_week,
        "active_users": active_users,
        "active_visitors": active_visitors,
        "active_sessions": active_sessions,
        "visits_last_7_days": visits_last_7_days,
        "top_pages": top_pages,
        "browsers": browsers,
        "operating_systems": operating_systems,
        "devices": devices,
        "visit_search": visit_search,
        "traffic_visits": traffic_page,
        "user_search": user_search,
        "users_page": users_page,
        "log_search": log_search,
        "log_type": log_type,
        "login_logs": login_logs,
    }

    return render(request, "analytics/dashboard.html", context)
