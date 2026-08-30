using TaskManager.Application.DTOs;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Services;

public class ReportService(IUnitOfWork unitOfWork) : IReportService
{
    public async Task<IEnumerable<PendingTaskReportDto>> GetPendingTasksReportAsync()
    {
        var results = await unitOfWork.Reports.GetPendingTasksAsync();
        return results.Select(r => new PendingTaskReportDto
        {
            Usuario = r.Usuario,
            TotalPendientes = r.TotalPendientes,
            TotalVencidas = r.TotalVencidas
        });
    }
}
