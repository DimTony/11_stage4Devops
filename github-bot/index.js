const { Probot } = require('probot');

module.exports = (app) => {
  app.on(
    ['pull_request.opened', 'pull_request.synchronize'],
    async (context) => {
      const pr = context.payload.pull_request;

      await context.octokit.issues.createComment(
        context.issue({
          body: `Deployment initiated for PR #${pr.number}. Please wait for the deployment to complete.`,
        })
      );
    }
  );

  app.on('check_run.completed', async (context) => {
    const checkRun = context.payload.check_run;
    const pr = context.payload.pull_request;

    if (checkRun.name === 'deploy' && pr) {
      const status = checkRun.conclusion === 'success' ? 'succeeded' : 'failed';
      const url = `http://<your-load-balancer-url>/${pr.number}`;

      await context.octokit.issues.createComment(
        context.issue({
          body: `Deployment ${status} for PR #${pr.number}. You can view it at ${url}`,
        })
      );
    }
  });

  app.on('pull_request.closed', async (context) => {
    const pr = context.payload.pull_request;

    // Cleanup logic here

    await context.octokit.issues.createComment(
      context.issue({
        body: `Deployment for PR #${pr.number} has been cleaned up.`,
      })
    );
  });
};
