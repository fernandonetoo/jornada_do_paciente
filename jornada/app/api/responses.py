from rest_framework.response import Response
from rest_framework.views import exception_handler


def api_response(data=None, message="", status_code=200, success=True, errors=None):
    body = {
        "success": success,
        "message": message,
        "data": data,
    }
    if errors is not None:
        body["errors"] = errors
    return Response(body, status=status_code)


def standard_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return response

    return api_response(
        data=None,
        message="Erro ao processar a requisição.",
        status_code=response.status_code,
        success=False,
        errors=response.data,
    )
