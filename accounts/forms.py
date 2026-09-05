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