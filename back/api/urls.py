from django.urls import path
from .views import UploadCSV, ListDebts, CompleteUpload

urlpatterns = [
    path('upload/', UploadCSV.as_view(), name='upload-csv'),
    path('upload/complete/', CompleteUpload.as_view(), name='complete-upload'),
    path('files/', ListDebts.as_view(), name='list-debts'),
]