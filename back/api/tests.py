from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from .models import Debt
import io

class DebtTests(APITestCase):
    def test_upload_csv(self):
        data = io.BytesIO(b'name,governmentID,email,debtAmount,debtDueDate,debtID\nJohn Doe,123456789,john@example.com,100.00,2024-12-31,123e4567-e89b-12d3-a456-426614174000')
        response = self.client.post(reverse('upload-csv'), {'file': data}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Debt.objects.count(), 1)
        self.assertEqual(Debt.objects.get().name, 'John Doe')

    def test_list_debts(self):
        response = self.client.get(reverse('list-debts'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)