using TaskManager.Domain.Entities;

namespace TaskManager.Domain.Interfaces;

public interface ITaskRepository
{
    Task<TaskItem?> GetByIdAsync(int id);
    Task<(IEnumerable<TaskItem> Items, int TotalCount)> GetAllAsync(
        string? priority = null,
        string? status = null,
        int? userId = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int page = 1,
        int pageSize = 20);
    Task<bool> ExistsByTitleAndUserAsync(string title, int userId, int? excludeId = null);
    Task AddAsync(TaskItem task);
    void Update(TaskItem task);
    void Delete(TaskItem task);
}
