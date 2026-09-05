from django import forms 
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.validators import ValidationError



class LoginForm(forms.Form):
    
    login = forms.CharField(
        label="ایمیل یا نام کاربری",
        max_length=300,
        required=True,
        widget= forms.TextInput(attrs={
            "class":"field",
            "placeholder":"example@email.com",
            "type":"text"
            
        })
    )
    
    password = forms.CharField(
        label = "رمز عبور",
        required=True,
        widget=forms.PasswordInput(attrs={
            "class":"field",
            "placeholder":"••••••••",
            "type":"password"
        })
    )
    remember_me = forms.BooleanField(
        label="مرا به‌خاطر بسپار",
        required=False,
        widget=forms.CheckboxInput(attrs={
            "class":"checkbox-row"
        })
    )
    def clean(self):
        
        login = self.cleaned_data.get("login")
        password = self.cleaned_data.get("password")
        
        if not login or not password:
            raise ValidationError("پسور یا نام کاربری وارد نشده است", code="empty_fileds")
        
        login = login.strip()
        
        if "@" in login :
            try :
                user = User.objects.get(email__iexact=login)
                username = user.username
            
            except user.DoesNotExist:
                raise ValidationError("ایمیل یا نام کاربری اشتباه است", code="invalid_user")
            
            except User.MultipleObjectsReturned:
                raise ValidationError("برای این ایمیل چند حساب کاربری وجود دارد.", code="multiple_user")
            
        else:
            username = login
            
        user = authenticate(username=username, password=password)
        
        if user is None :
            raise ValidationError("ایمیل یا نام کاربری اشتباه است", code="wrong_info")

        self.user = user
        
class RegisterForm(forms.Form):
    
    username = forms.CharField(
        max_length=200,
        label= "نام کاربری",
        required=True,
        widget=forms.TextInput(attrs={
            "placeholder":"نام کاربری شما"
        })
        )
    email = forms.EmailField(
        required=True,
        label="ایمیل",
        widget=forms.EmailInput(attrs={
            "placeholder":"example@email.com"
        })
    )
    password = forms.CharField(
        required=True,
        label="رمز عبور",
        widget=forms.PasswordInput(attrs={
            "placeholder":"حداقل ۸ کاراکتر"
        })
    )
    password1 = forms.CharField(
            required=True,
            label="تکرار رمز عبور",
            widget=forms.PasswordInput(attrs={
                "placeholder":"حداقل ۸ کاراکتر"
            })
        )
    
    def clean_username(self):
        
        username = self.cleaned_data.get("username")
        
        if User.objects.filter(username=username).exists():
            raise ValidationError("این نام کاربری قبلا ثبت شده است", code="username_exist")
        
        return username
    
    def clean_email(self):
        
        email = self.cleaned_data.get("email")
        if User.objects.filter(email=email).exists():
            raise ValidationError("ایمیل متعلق به اکانت دیگری است ", code="email_exist")
        
        return email
        
    def clean(self):
        
        password1 = self.cleaned_data.get("password")
        password2 = self.cleaned_data.get("password1")
        
        if password1 != password2 :
            raise ValidationError("رمز عبور و تکرار آن یکسان نیست", code="not_same_pass")
            