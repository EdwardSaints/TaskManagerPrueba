using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Interfaces;
using TaskManager.Domain.Models;
using TaskManager.Infrastructure.Data;

namespace TaskManager.Infrastructure.Repositories;

public class ReportRepository(AppDbContext context) : IReportRepository
{
    public async Task<IEnumerable<PendingTaskReport>> GetPendingTasksAsync()
    {
        return await context.Database
            .SqlQueryRaw<PendingTaskReport>("EXEC sp_GetPendingTasks")
            .ToListAsync();
    }
}
