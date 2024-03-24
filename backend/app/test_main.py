from fastapi.testclient import TestClient
import datetime

from .main import app
import config

client = TestClient(app)


def test_read_main():
    response = client.get("/health")
    assert response.status_code == 204


def test_webhook_create():
    response = client.post(
        "/api/v1/webhooks/sessions",
        headers={
            "X-Cal-Signature-256": config.CALCOM_SECRET
        },
        json={
            "triggerEvent": "BOOKING_CREATED",
            "createdAt": "2023-05-24T09:30:00.538Z",
            "payload": {
                "type": "60min",
                "title": "60min between Pro Example and John Doe",
                "description": "",
                "additionalNotes": "",
                "customInputs": {},
                "startTime": (datetime.datetime.now() + datetime.timedelta(days=1, hours=1)).isoformat(),
                "endTime": (datetime.datetime.now() + datetime.timedelta(days=1, hours=2)).isoformat(),
                "organizer": {
                    "id": 5,
                    "name": "Pro Example",
                    "email": "pro@example.com",
                    "username": "pro",
                    "timeZone": "Asia/Kolkata",
                    "language": {
                        "locale": "en"
                    },
                    "timeFormat": "h:mma"
                },
                "responses": {
                    "name": {
                        "label": "your_name",
                        "value": "John Doe"
                    },
                    "email": {
                        "label": "email_address",
                        "value": "john.doe@example.com"
                    },
                    "location": {
                        "label": "location",
                        "value": {
                            "optionValue": "",
                            "value": "inPerson"
                        }
                    },
                    "notes": {
                        "label": "additional_notes"
                    },
                    "guests": {
                        "label": "additional_guests"
                    },
                    "rescheduleReason": {
                        "label": "reschedule_reason"
                    }
                },
                "userFieldsResponses": {},
                "attendees": [
                    {
                        "email": "admin@admin.tld",
                        "name": "John Doe",
                        "timeZone": "Asia/Kolkata",
                        "language": {
                            "locale": "en"
                        }
                    }
                ],
                "location": "Calcom HQ",
                "destinationCalendar": {
                    "id": 10,
                    "integration": "apple_calendar",
                    "externalId": "https://caldav.icloud.com/1234567/calendars/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/",
                    "userId": 5,
                    "eventTypeId": None,
                    "credentialId": 1
                },
                "hideCalendarNotes": False,
                "requiresConfirmation": None,
                "eventTypeId": 7,
                "seatsShowAttendees": True,
                "seatsPerTimeSlot": None,
                "uid": "bFJeNb2uX8ANpT3JL5EfXw",
                "appsStatus": [
                    {
                        "appName": "Apple Calendar",
                        "type": "apple_calendar",
                        "success": 1,
                        "failures": 0,
                        "errors": [],
                        "warnings": []
                    }
                ],
                "eventTitle": "60min",
                "eventDescription": "",
                "price": 0,
                "currency": "usd",
                "length": 60,
                "bookingId": 91,
                "metadata": {},
                "status": "ACCEPTED"
            }
        }
    )

    assert response.status_code == 202, (response.status_code,
                                         response.content.decode("utf-8"))
