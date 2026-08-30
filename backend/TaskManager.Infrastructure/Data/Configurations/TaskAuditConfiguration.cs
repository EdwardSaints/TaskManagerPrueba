using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Domain.Entities;

namespace TaskManager.Infrastructure.Data.Configurations;

public class TaskAuditConfiguration : IEntityTypeConfiguration<TaskAudit>
{
    public void Configure(EntityTypeBuilder<TaskAudit> builder)
    {
        builder.ToTable("TaskAudit");
        builder.HasKey(a => a.AuditId);
        builder.Property(a => a.OldStatus).IsRequired().HasMaxLength(20);
        builder.Property(a => a.NewStatus).IsRequired().HasMaxLength(20);
        builder.Property(a => a.ChangedAt).IsRequired().HasDefaultValueSql("GETDATE()");
        builder.HasOne(a => a.Task).WithMany().HasForeignKey(a => a.TaskId).OnDelete(DeleteBehavior.Restrict);
    }
}
