using TaskManager.Application.DTOs;

namespace TaskManager.Application.Services;

public interface IReportService
{
    Task<IEnumerable<PendingTaskReportDto>> GetPendingTasksReportAsync();
}
