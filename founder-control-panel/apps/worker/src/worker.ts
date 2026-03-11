/**
 * Worker polls queued jobs and executes long-running AI tasks.
 */
import { runBlueprintJob } from './jobs/blueprint.job.js';

async function main() {
  await runBlueprintJob();
  setTimeout(main, 5000);
}

main().catch((err) => {
  console.error('worker-failure', err);
  process.exit(1);
});
