using Microsoft.AspNetCore.Mvc;
using TaskManager.API.Models;
using TaskManager.Application.DTOs;
using TaskManager.Application.Services;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class TasksController(ITaskService taskService) : ControllerBase
{
    /// <summary>
    /// Obtiene todas las tareas con filtros y paginación.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResultDto<TaskDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] TaskFilterDto filter)
    {
        var result = await taskService.GetAllAsync(filter);
        return Ok(ApiResponse<PagedResultDto<TaskDto>>.Ok(result));
    }

    /// <summary>
    /// Obtiene una tarea por su Id.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<TaskDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await taskService.GetByIdAsync(id);
        return Ok(ApiResponse<TaskDto>.Ok(result));
    }

    /// <summary>
    /// Crea una nueva tarea.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<TaskDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreateTaskDto dto)
    {
        var result = await taskService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<TaskDto>.Ok(result, "Tarea creada exitosamente."));
    }

    /// <summary>
    /// Actualiza una tarea existente.
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<TaskDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTaskDto dto)
    {
        var result = await taskService.UpdateAsync(id, dto);
        return Ok(ApiResponse<TaskDto>.Ok(result, "Tarea actualizada exitosamente."));
    }

    /// <summary>
    /// Elimina una tarea (borrado lógico).
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        await taskService.DeleteAsync(id);
        return NoContent();
    }
}
