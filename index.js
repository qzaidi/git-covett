const repos = require('./repos')
const probotKit = require('probot-kit')

module.exports = app => {

  app.on('installation.created', check)

  async function check (context) {
    // this runs only for the first time on each new installation
    // shows all repos you've installed the app on
    context.log("going to list repositories")
    console.log(context.payload.repositories)

    const owner = context.payload.installation.account.login
    context.payload.repositories.forEach(async (repository) => {
      context.log("processing repository", repository.name)
      const repo = repository.name
    })
  }

   app.on('push', async context => {
    // Code was pushed to the repo, what should we do with it?
    const commitSha = probotKit.getSha(context)
    const repoName = probotKit.getRepoName(context)
    app.log("code push on",repoName,commitSha)

    if (commitSha == "0000000000000000000000000000000000000000") {
      return // branch deletion
    }


    const author = probotKit.getCommitAuthorName(context)
    const branchName = probotKit.getBranchName(context)

    app.log("commit by ",author," in branch ",branchName)

    const repoPrefix = `${repoName}|${branchName}|${commitSha}`

    for (const file of await probotKit.currentCommitFiles(context)) {
      const filePath = `${repoPrefix}|${file.filename}`
      app.log("changed ",filePath)
    }
    return
  })

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
  const refresh = async () => {
		// Authenticate the application and get all of its installations
		const githubApp = await app.auth();
		const installations = await githubApp.apps.listInstallations();
    installations.data.forEach(async ({ id }) => {
			const github = await app.auth(id);
      var repositories = await repos.list(github)
      var r = repositories
        .filter(repository => !! repository)
        .filter(({ archived }) => !archived)
        .filter(({ fork }) => !fork)
        .map(({ name, owner, clone_url }) => {

        // now do whatever you want to do with the existing installations, including auth etc
         return {
           orgId: id,
           name: name,
           owner: owner.login,
           remoteURI: clone_url,
         };
      });

      repositories.forEach(async ({ name, owner }) => {
        const reference = await github.gitdata.getReference({
          owner: owner.login, // the owner of the repo
          repo: name,  // the repo
          ref: 'heads/master'
        });
        app.log.debug(name,reference.data.object.sha)
      });
    });
  };
  //refresh();
}
