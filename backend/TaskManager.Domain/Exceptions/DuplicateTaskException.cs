namespace TaskManager.Domain.Exceptions;

public class DuplicateTaskException(string title, string userName) 
    : BusinessRuleException($"Ya existe una tarea con el título '{title}' asignada al usuario '{userName}'.")
{
    public string Title { get; } = title;
    public string UserName { get; } = userName;
}
