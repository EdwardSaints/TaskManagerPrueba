using TaskManager.Domain.Entities;

namespace TaskManager.Domain.Interfaces;

public interface IUserRepository
{
    Task<IEnumerable<User>> GetAllActiveAsync();
    Task<User?> GetByIdAsync(int id);
}
