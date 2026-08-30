using AutoMapper;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Exceptions;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Services;

public class TaskService(IUnitOfWork unitOfWork, IMapper mapper) : ITaskService
{
    public async Task<PagedResultDto<TaskDto>> GetAllAsync(TaskFilterDto filter)
    {
        var (items, totalCount) = await unitOfWork.Tasks.GetAllAsync(
            filter.Priority, filter.Status, filter.UserId,
            filter.StartDate, filter.EndDate,
            filter.Page, filter.PageSize);

        return new PagedResultDto<TaskDto>
        {
            Items = mapper.Map<IEnumerable<TaskDto>>(items),
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<TaskDto> GetByIdAsync(int id)
    {
        var task = await unitOfWork.Tasks.GetByIdAsync(id)
            ?? throw new NotFoundException("Tarea", id);
        return mapper.Map<TaskDto>(task);
    }

    public async Task<TaskDto> CreateAsync(CreateTaskDto dto)
    {
        // Check for duplicate title per user
        if (await unitOfWork.Tasks.ExistsByTitleAndUserAsync(dto.Title, dto.UserId))
        {
            var user = await unitOfWork.Users.GetByIdAsync(dto.UserId);
            throw new DuplicateTaskException(dto.Title, user?.Name ?? "Desconocido");
        }

        var task = mapper.Map<TaskItem>(dto);
        task.CreatedAt = DateTime.UtcNow;

        await unitOfWork.Tasks.AddAsync(task);
        await unitOfWork.SaveChangesAsync();

        // Reload with User
        var created = await unitOfWork.Tasks.GetByIdAsync(task.Id);
        return mapper.Map<TaskDto>(created!);
    }

    public async Task<TaskDto> UpdateAsync(int id, UpdateTaskDto dto)
    {
        var task = await unitOfWork.Tasks.GetByIdAsync(id)
            ?? throw new NotFoundException("Tarea", id);

        // Check for duplicate title per user (excluding current task)
        if (await unitOfWork.Tasks.ExistsByTitleAndUserAsync(dto.Title, dto.UserId, id))
        {
            var user = await unitOfWork.Users.GetByIdAsync(dto.UserId);
            throw new DuplicateTaskException(dto.Title, user?.Name ?? "Desconocido");
        }

        mapper.Map(dto, task);
        task.UpdatedAt = DateTime.UtcNow;

        unitOfWork.Tasks.Update(task);
        await unitOfWork.SaveChangesAsync();

        var updated = await unitOfWork.Tasks.GetByIdAsync(id);
        return mapper.Map<TaskDto>(updated!);
    }

    public async Task DeleteAsync(int id)
    {
        var task = await unitOfWork.Tasks.GetByIdAsync(id)
            ?? throw new NotFoundException("Tarea", id);

        unitOfWork.Tasks.Delete(task);
        await unitOfWork.SaveChangesAsync();
    }
}
