using TaskManager.Domain.Models;

namespace TaskManager.Domain.Interfaces;

public interface IReportRepository
{
    Task<IEnumerable<PendingTaskReport>> GetPendingTasksAsync();
}
