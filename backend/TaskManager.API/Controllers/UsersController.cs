using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using TaskManager.API.Models;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Interfaces;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class UsersController(IUnitOfWork unitOfWork, IMapper mapper) : ControllerBase
{
    /// <summary>
    /// Obtiene todos los usuarios activos.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<UserDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var users = await unitOfWork.Users.GetAllActiveAsync();
        var dtos = mapper.Map<IEnumerable<UserDto>>(users);
        return Ok(ApiResponse<IEnumerable<UserDto>>.Ok(dtos));
    }
}
