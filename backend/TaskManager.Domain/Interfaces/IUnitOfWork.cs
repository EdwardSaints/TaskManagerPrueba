namespace TaskManager.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    ITaskRepository Tasks { get; }
    IUserRepository Users { get; }
    IReportRepository Reports { get; }
    Task<int> SaveChangesAsync();
}
