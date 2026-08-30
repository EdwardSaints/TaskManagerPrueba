namespace TaskManager.Domain.Exceptions;

public class BusinessRuleException(string message) : Exception(message);
