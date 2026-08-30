using System.Net;
using System.Text.Json;
using TaskManager.API.Models;
using TaskManager.Domain.Exceptions;

namespace TaskManager.API.Middleware;

public class GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error no controlado: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, response) = exception switch
        {
            NotFoundException notFound => (
                (int)HttpStatusCode.NotFound,
                ApiResponse<object>.Fail(notFound.Message)
            ),
            DuplicateTaskException duplicate => (
                (int)HttpStatusCode.Conflict,
                ApiResponse<object>.Fail(duplicate.Message)
            ),
            BusinessRuleException business => (
                (int)HttpStatusCode.BadRequest,
                ApiResponse<object>.Fail(business.Message)
            ),
            _ => (
                (int)HttpStatusCode.InternalServerError,
                ApiResponse<object>.Fail("Ocurrió un error interno en el servidor.")
            )
        };

        context.Response.StatusCode = statusCode;
        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        await context.Response.WriteAsync(json);
    }
}
