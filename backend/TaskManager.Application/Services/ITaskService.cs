using TaskManager.Application.DTOs;

namespace TaskManager.Application.Services;

public interface ITaskService
{
    Task<PagedResultDto<TaskDto>> GetAllAsync(TaskFilterDto filter);
    Task<TaskDto> GetByIdAsync(int id);
    Task<TaskDto> CreateAsync(CreateTaskDto dto);
    Task<TaskDto> UpdateAsync(int id, UpdateTaskDto dto);
    Task DeleteAsync(int id);
}
