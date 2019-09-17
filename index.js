// Git Data API use case example
// See: https://developer.github.com/v3/git/ to learn more

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {

  // Opens a PR every time someone installs your app for the first time
  app.on('installation.created', check)
  async function check (context) {
    // shows all repos you've installed the app on
    context.log("going to list repositories")
    console.log(context.payload.repositories)

    const owner = context.payload.installation.account.login
    context.payload.repositories.forEach(async (repository) => {
      context.log("processing repositories")
      const repo = repository.name

      // Generates a random number to ensure the git reference isn't already taken
      // NOTE: this is not recommended and just shows an example so it can work :)

      // test
      const branch = `new-branch-${Math.floor(Math.random() * 9999)}`

      // Get current reference in Git
      const reference = await context.github.gitdata.getReference({
        repo, // the repo
        owner, // the owner of the repo
        ref: 'heads/master'
      })
      // Create a branch
      await context.github.gitdata.createReference({
        repo,
        owner,
        ref: `refs/heads/${branch}`,
        sha: reference.data.object.sha // accesses the sha from the heads/master reference we got
      })
      // create a new file
      await context.github.repos.createFile({
        repo,
        owner,
        path: 'path/to/your/file.md', // the path to your config file
        message: 'adds config file', // a commit message
        content: Buffer.from('My new file is awesome!').toString('base64'),
        // the content of your file, must be base64 encoded
        branch // the branch name we used when creating a Git reference
      })
      // create a PR from that branch with the commit of our added file
      await context.github.pullRequests.create({
        repo,
        owner,
        title: 'Adding my file!', // the title of the PR
        head: branch, // the branch our chances are on
        base: 'master', // the branch to which you want to merge your changes
        body: 'Adds my new file!', // the body of your PR,
        maintainer_can_modify: true // allows maintainers to edit your app's PR
      })
    })
  }
  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
  const refresh = async () => {
		// Authenticate the application and get all of its installations
		const githubApp = await app.auth();
		const installations = await githubApp.apps.listInstallations();
    console.log(installations);

    // now do whatever you want to do with the existing installations, including auth etc

	};

  refresh();
}
