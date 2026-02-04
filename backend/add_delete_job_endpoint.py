#!/usr/bin/env python3
"""
Add delete job endpoint for customers to delete their jobs
"""

import sys

SERVER_FILE = "/srv/app/Handyman-app/backend/server.py"

NEW_DELETE_ENDPOINT = '''
@api_router.delete("/jobs/{job_id}")
async def delete_job(
    job_id: str,
    current_user: User = Depends(get_current_user_dependency),
):
    """
    Delete a job.

    Only the customer who created the job can delete it.
    Only jobs in 'pending' or 'draft' status can be deleted.
    Performs a soft delete by setting status to 'cancelled'.
    """
    # Find the job
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(404, detail="Job not found")

    # Check ownership
    if job["customer_id"] != current_user.id:
        raise HTTPException(403, detail="You can only delete your own jobs")

    # Check if job can be deleted (only draft or posted jobs)
    if job["status"] not in ["draft", "posted"]:
        raise HTTPException(
            400,
            detail=f"Cannot delete job in '{job['status']}' status. Only pending or draft jobs can be deleted."
        )

    # Soft delete - set status to cancelled
    await db.jobs.update_one(
        {"id": job_id},
        {
            "$set": {
                "status": "cancelled",
                "updated_at": datetime.utcnow()
            }
        }
    )

    logger.info(f"Job {job_id} cancelled by customer {current_user.id}")

    return {"success": True, "message": "Job has been cancelled"}

'''

try:
    with open(SERVER_FILE, 'r') as f:
        content = f.read()

    # Find a good place to insert - after the @api_router.patch("/jobs/{job_id}", response_model=Job) endpoint
    # Look for the update job endpoint
    marker = '@api_router.patch("/jobs/{job_id}", response_model=Job)'

    if marker not in content:
        print(f"❌ Could not find marker: {marker}")
        sys.exit(1)

    # Find the end of the update_job function (look for next @api_router or # ====)
    marker_pos = content.find(marker)

    # Find next endpoint marker after update_job
    next_route_pos = content.find('@api_router.', marker_pos + 100)
    next_section_pos = content.find('# ====', marker_pos + 100)

    insert_pos = min(x for x in [next_route_pos, next_section_pos] if x > marker_pos)

    if insert_pos == -1:
        print("❌ Could not find insertion point")
        sys.exit(1)

    # Insert the new endpoint
    new_content = content[:insert_pos] + NEW_DELETE_ENDPOINT + '\n' + content[insert_pos:]

    with open(SERVER_FILE, 'w') as f:
        f.write(new_content)

    print("✅ Successfully added DELETE /jobs/{job_id} endpoint")
    print(f"   Inserted at position {insert_pos}")
    print("   Customers can now delete their pending/draft jobs")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
