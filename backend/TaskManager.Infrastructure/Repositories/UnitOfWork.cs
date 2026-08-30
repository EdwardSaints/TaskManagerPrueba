using TaskManager.Domain.Interfaces;
using TaskManager.Infrastructure.Data;

namespace TaskManager.Infrastructure.Repositories;

public class UnitOfWork(
    AppDbContext context, 
    ITaskRepository tasks, 
    IUserRepository users,
    IReportRepository reports) : IUnitOfWork
{
    public ITaskRepository Tasks => tasks;
    public IUserRepository Users => users;
    public IReportRepository Reports => reports;

    public async Task<int> SaveChangesAsync() => await context.SaveChangesAsync();

    public void Dispose() => context.Dispose();
}
