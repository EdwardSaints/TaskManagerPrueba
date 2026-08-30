using FluentValidation;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Validators;

public class CreateTaskValidator : AbstractValidator<CreateTaskDto>
{
    public CreateTaskValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("El título es obligatorio.")
            .MaximumLength(150).WithMessage("El título no puede exceder 150 caracteres.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("La descripción no puede exceder 500 caracteres.");

        RuleFor(x => x.Priority)
            .NotEmpty().WithMessage("La prioridad es obligatoria.")
            .Must(p => p is "Alta" or "Media" or "Baja")
            .WithMessage("La prioridad debe ser: Alta, Media o Baja.");

        RuleFor(x => x.Status)
            .NotEmpty().WithMessage("El estatus es obligatorio.")
            .Must(s => s is "Pendiente" or "En progreso" or "Terminada")
            .WithMessage("El estatus debe ser: Pendiente, En progreso o Terminada.");

        RuleFor(x => x.DueDate)
            .GreaterThanOrEqualTo(DateTime.Today)
            .WithMessage("La fecha límite no puede ser menor a hoy.");

        RuleFor(x => x.UserId)
            .GreaterThan(0).WithMessage("Debe asignar un usuario responsable.");
    }
}
