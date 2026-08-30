using AutoMapper;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Enums;

namespace TaskManager.Application.Mappings;

public class TaskProfile : Profile
{
    public TaskProfile()
    {
        CreateMap<TaskItem, TaskDto>()
            .ForMember(d => d.Priority, opt => opt.MapFrom(s => s.Priority.ToString()))
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status == TaskItemStatus.EnProgreso ? "En progreso" : s.Status.ToString()))
            .ForMember(d => d.UserName, opt => opt.MapFrom(s => s.User.Name));

        CreateMap<CreateTaskDto, TaskItem>()
            .ForMember(d => d.Priority, opt => opt.MapFrom(s => Enum.Parse<TaskPriority>(s.Priority)))
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status == "En progreso" ? TaskItemStatus.EnProgreso : Enum.Parse<TaskItemStatus>(s.Status)));

        CreateMap<UpdateTaskDto, TaskItem>()
            .ForMember(d => d.Priority, opt => opt.MapFrom(s => Enum.Parse<TaskPriority>(s.Priority)))
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status == "En progreso" ? TaskItemStatus.EnProgreso : Enum.Parse<TaskItemStatus>(s.Status)));
    }
}
