module "pipeline" {
  source                  = "git@github.com:mentorpal/terraform-modules//modules/gitflow_cicd_pipeline?ref=tags/v1.6.1"
  codestar_connection_arn = var.codestar_connection_arn
  project_name            = "gai-jupyter"
  github_repo_name        = "gai-jupyter"
  github_org              = "game-if-ai"
  github_branch_dev       = "main"
  github_branch_release   = "release"

  # reference: https://github.com/cloudposse/terraform-aws-codebuild#inputs
  build_image  = "aws/codebuild/standard:5.0"
  deploy_image = "aws/codebuild/standard:5.0"
  # https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-compute-types.html
  build_compute_type   = "BUILD_GENERAL1_MEDIUM"
  deploys_compute_type = "BUILD_GENERAL1_MEDIUM"
  build_cache_type     = "NO_CACHE"
  deploy_cache_type    = "NO_CACHE"

  build_buildspec       = "cicd/buildspec.yml"
  deploy_dev_buildspec  = "cicd/deployspec-dev.yml"
  deploy_qa_buildspec   = "cicd/deployspec-qa.yml"
  deploy_prod_buildspec = "cicd/deployspec-prod.yml"

  builds_privileged_mode  = false
  deploys_privileged_mode = false

  enable_e2e_tests            = false
  enable_status_notifications = false #TODO: turn back on once Slack Notification is ready

  tags = {
    Source  = "terraform"
    Project = "game-if-ai"
  }

  providers = {
    aws = aws.us_east_1
  }
}
