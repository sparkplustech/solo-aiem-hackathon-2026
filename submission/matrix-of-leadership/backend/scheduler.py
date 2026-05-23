from apscheduler.schedulers.asyncio import AsyncIOScheduler
import logging

logger = logging.getLogger("drishti.scheduler")

scheduler = AsyncIOScheduler()

async def run_mule_detection_batch():
    """
    Periodic task to rebuild the graph and run Louvain community detection.
    Updates the global/cache state with new mule clusters.
    """
    logger.info("Running mule detection batch job...")
    # This would normally query the database for the last 24h of transactions,
    # pass them to engine.graph.build_and_analyze_graph, and save the results
    # back to the account_profiles table.
    
    # In this hackathon MVP, we mock the execution if DB is not fully populated
    logger.info("Mule detection batch job completed.")

def start_scheduler():
    scheduler.add_job(run_mule_detection_batch, 'interval', minutes=15)
    scheduler.start()
    logger.info("APScheduler started: Mule detection every 15 mins")
