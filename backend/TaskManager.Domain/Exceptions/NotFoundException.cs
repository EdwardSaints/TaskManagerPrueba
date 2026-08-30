namespace TaskManager.Domain.Exceptions;

public class NotFoundException(string entityName, object key) 
    : Exception($"{entityName} con Id '{key}' no fue encontrado.")
{
    public string EntityName { get; } = entityName;
    public object Key { get; } = key;
}
