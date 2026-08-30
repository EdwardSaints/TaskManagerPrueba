using Microsoft.AspNetCore.Mvc;
using TaskManager.API.Models;
using TaskManager.Application.DTOs;
using TaskManager.Application.Services;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ReportsController(IReportService reportService) : ControllerBase
{
    /// <summary>
    /// Obtiene el reporte de tareas pendientes y vencidas por usuario.
    /// </summary>
    [HttpGet("pending-tasks")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<PendingTaskReportDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPendingTasks()
    {
        var result = await reportService.GetPendingTasksReportAsync();
        return Ok(ApiResponse<IEnumerable<PendingTaskReportDto>>.Ok(result));
    }
}
