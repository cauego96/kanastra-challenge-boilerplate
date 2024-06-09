import uuid
from django.db import models

class Debt(models.Model):
    name = models.CharField(max_length=255)
    governmentID = models.CharField(max_length=20)
    email = models.EmailField()
    debtAmount = models.DecimalField(max_digits=10, decimal_places=2)
    debtDueDate = models.DateField()
    debtID = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    def __str__(self):
        return self.name