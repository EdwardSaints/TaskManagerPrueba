namespace TaskManager.Domain.Entities;

public class TaskAudit
{
    public int AuditId { get; set; }
    public int TaskId { get; set; }
    public string OldStatus { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    public TaskItem Task { get; set; } = null!;
}
