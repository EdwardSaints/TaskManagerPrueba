namespace TaskManager.Application.DTOs;

public class TaskFilterDto
{
    public string? Priority { get; set; }
    public string? Status { get; set; }
    public int? UserId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
