using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Interfaces;
using TaskManager.Infrastructure.Data;

namespace TaskManager.Infrastructure.Repositories;

public class TaskRepository(AppDbContext context) : ITaskRepository
{
    public async Task<TaskItem?> GetByIdAsync(int id)
    {
        return await context.Tasks
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<(IEnumerable<TaskItem> Items, int TotalCount)> GetAllAsync(
        string? priority = null,
        string? status = null,
        int? userId = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int page = 1,
        int pageSize = 20)
    {
        var query = context.Tasks.Include(t => t.User).AsQueryable();

        if (!string.IsNullOrEmpty(priority) && Enum.TryParse<TaskPriority>(priority, out var p))
            query = query.Where(t => t.Priority == p);

        if (!string.IsNullOrEmpty(status))
        {
            var statusEnum = status switch
            {
                "En progreso" => TaskItemStatus.EnProgreso,
                "Pendiente" => TaskItemStatus.Pendiente,
                "Terminada" => TaskItemStatus.Terminada,
                _ => Enum.TryParse<TaskItemStatus>(status, out var s) ? s : (TaskItemStatus?)null
            };
            if (statusEnum.HasValue)
                query = query.Where(t => t.Status == statusEnum.Value);
        }

        if (userId.HasValue)
            query = query.Where(t => t.UserId == userId.Value);

        if (startDate.HasValue)
            query = query.Where(t => t.CreatedAt.Date >= startDate.Value.Date);

        if (endDate.HasValue)
            query = query.Where(t => t.CreatedAt.Date <= endDate.Value.Date);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<bool> ExistsByTitleAndUserAsync(string title, int userId, int? excludeId = null)
    {
        var query = context.Tasks.Where(t => t.Title == title && t.UserId == userId);
        if (excludeId.HasValue)
            query = query.Where(t => t.Id != excludeId.Value);
        return await query.AnyAsync();
    }

    public async Task AddAsync(TaskItem task) => await context.Tasks.AddAsync(task);
    public void Update(TaskItem task) => context.Tasks.Update(task);
    public void Delete(TaskItem task)
    {
        task.IsDeleted = true;
        task.UpdatedAt = DateTime.UtcNow;
        context.Tasks.Update(task);
    }
}
