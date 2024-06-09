from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Debt
from .serializers import DebtSerializer
import csv
import io
import zipfile
import os
import decimal
from django.core.paginator import Paginator
from .pagination import CustomPagination
from django.conf import settings
import datetime
from django.db import transaction

class UploadCSV(APIView):
    def post(self, request, format=None):
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        uploaded_file = request.FILES['file']

        temp_dir = 'temp_uploads'
        if not os.path.exists(temp_dir):
            os.makedirs(temp_dir)

        part_file_path = os.path.join(temp_dir, uploaded_file.name)
        with open(part_file_path, 'wb') as temp_file:
            for chunk in uploaded_file.chunks():
                temp_file.write(chunk)

        return Response(status=status.HTTP_200_OK)

class CompleteUpload(APIView):
    def post(self, request, format=None):
        total_chunks = request.data.get('totalChunks')
        file_name = request.data.get('fileName')
        print(f"Received totalChunks: {total_chunks}, fileName: {file_name}")
        if not total_chunks or not file_name:
            return Response({'error': 'Missing totalChunks or fileName'}, status=status.HTTP_400_BAD_REQUEST)

        total_chunks = int(total_chunks)
        temp_dir = 'temp_uploads'
        file_name = file_name.split('.part')[0]
        complete_file_path = os.path.join(temp_dir, file_name)

        print(f"Complete file path: {complete_file_path}")
        
        with open(complete_file_path, 'wb') as complete_file:
            for i in range(total_chunks):
                part_file_path = os.path.join(temp_dir, f'{file_name}.part{i}')
                print(f"Processing fragment: {part_file_path}")
                if not os.path.exists(part_file_path):
                    return Response({'error': f'Fragment file {part_file_path} not found'}, status=status.HTTP_400_BAD_REQUEST)
                with open(part_file_path, 'rb') as part_file:
                    complete_file.write(part_file.read())
                os.remove(part_file_path)  # Remove o fragmento após leitura

        # Processa o arquivo completo
        try:
            with zipfile.ZipFile(complete_file_path, 'r') as zip_ref:
                for filename in zip_ref.namelist():
                    print(f"Processing filename: {filename}")
                    if filename.endswith('.csv'):
                        file_data = zip_ref.read(filename)
                        data_set = file_data.decode('UTF-8')
                        io_string = io.StringIO(data_set)
                        next(io_string)
                        initialTime = datetime.datetime.now()
                        print(f"Processing filename: {filename} in time {initialTime}")
                        #with transaction.atomic(): aumentou o tempo
                        for column in csv.reader(io_string, delimiter=',', quotechar='"'):
                            if len(column) != 6:
                                return Response({'error': f'io_string {io_string}'}, status=status.HTTP_400_BAD_REQUEST)

                            try:
                                debt_amount = decimal.Decimal(column[3].replace(',', '').strip())
                                Debt.objects.update_or_create(
                                    name=column[0].strip(),
                                    governmentID=column[1].strip(),
                                    email=column[2].strip(),
                                    debtAmount=debt_amount,
                                    debtDueDate=column[4].strip(),
                                    debtID=column[5].strip()
                                )
                            except (decimal.InvalidOperation, ValueError, IndexError) as e:
                                continue
                        finalTime = datetime.datetime.now()
                        print(f"Concluded in time {finalTime}")
                        print(f"Delay {finalTime - initialTime}")
        except zipfile.BadZipFile:
            return Response({'error': 'Bad zip file'}, status=status.HTTP_400_BAD_REQUEST)

        os.remove(complete_file_path)  # Remove o arquivo após processar

        return Response(status=status.HTTP_201_CREATED)
                
class ListDebts(APIView):
    pagination_class = CustomPagination

    def get(self, request, format=None):
        debts = Debt.objects.all().order_by('governmentID')
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(debts, request)
        #print(f"page {page}")
        serializer = DebtSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)