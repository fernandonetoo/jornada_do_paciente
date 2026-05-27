from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from app.models import FrontendRecord, UserProfile


class CollectionPermissionTests(APITestCase):
    def setUp(self):
        FrontendRecord.objects.all().delete()
        UserProfile.objects.all().delete()
        User.objects.all().delete()

        self.patient = self.create_user(
            "paciente@example.com",
            "Paciente",
            "11111111111",
            ["paciente"],
        )
        self.other_patient = self.create_user(
            "outro@example.com",
            "Outro Paciente",
            "22222222222",
            ["paciente"],
        )
        self.ubs_doctor = self.create_user(
            "ubs@example.com",
            "Medico UBS",
            "33333333333",
            ["medico_ubs"],
        )
        self.oncologist = self.create_user(
            "onco@example.com",
            "Oncologista",
            "44444444444",
            ["medico_oncologista"],
        )

        self.create_record("pacientes", "11111111111", {"cpf": "11111111111", "nome": "Paciente"})
        self.create_record("pacientes", "22222222222", {"cpf": "22222222222", "nome": "Outro Paciente"})
        self.create_record(
            "regulacao",
            "22222222222",
            {
                "pacienteId": "22222222222",
                "pacienteNome": "Outro Paciente",
                "medicoEmail": "onco@example.com",
            },
        )

    def create_user(self, email, nome, cpf, grupos):
        user = User.objects.create_user(username=email, email=email, password="123456")
        UserProfile.objects.create(user=user, nome=nome, cpf=cpf, grupos=grupos)
        return user

    def create_record(self, kind, cpf, payload):
        return FrontendRecord.objects.create(
            kind=kind,
            patient_cpf=cpf,
            payload=payload,
            created_by=self.ubs_doctor,
            updated_by=self.ubs_doctor,
        )

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def response_items(self, response):
        return response.data["data"]

    def test_patient_only_reads_own_collection_records(self):
        self.authenticate(self.patient)

        response = self.client.get("/api/v1/collections/pacientes/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [item["cpf"] for item in self.response_items(response)],
            ["11111111111"],
        )

    def test_patient_cannot_replace_clinical_collections(self):
        self.authenticate(self.patient)

        response = self.client.put(
            "/api/v1/collections/consulta/",
            {"items": [{"pacienteId": "11111111111", "tipo": "Consulta"}]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_oncologist_only_reads_assigned_patient_records(self):
        self.authenticate(self.oncologist)

        response = self.client.get("/api/v1/collections/pacientes/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [item["cpf"] for item in self.response_items(response)],
            ["22222222222"],
        )

    def test_oncologist_cannot_write_diagnosis_for_unassigned_patient(self):
        self.authenticate(self.oncologist)

        response = self.client.put(
            "/api/v1/collections/diagnosticos/",
            {"items": [{"pacienteId": "11111111111", "titulo": "Diagnostico"}]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_oncologist_can_write_diagnosis_for_assigned_patient(self):
        self.authenticate(self.oncologist)

        response = self.client.put(
            "/api/v1/collections/diagnosticos/",
            {"items": [{"pacienteId": "22222222222", "titulo": "Diagnostico"}]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.response_items(response)[0]["pacienteId"], "22222222222")

    def test_ubs_doctor_cannot_replace_diagnosis_collection(self):
        self.authenticate(self.ubs_doctor)

        response = self.client.put(
            "/api/v1/collections/diagnosticos/",
            {"items": [{"pacienteId": "22222222222", "titulo": "Diagnostico"}]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
