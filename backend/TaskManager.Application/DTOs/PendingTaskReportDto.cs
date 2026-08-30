namespace TaskManager.Application.DTOs;

public class PendingTaskReportDto
{
    public string Usuario { get; set; } = string.Empty;
    public int TotalPendientes { get; set; }
    public int TotalVencidas { get; set; }
}
