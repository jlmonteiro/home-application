import com.github.gradle.node.npm.task.NpmTask

plugins {
    alias(libs.plugins.node)
    id("base")
}

node {
    version.set("22.12.0") // Using a stable LTS version
    download.set(true)
}

tasks.named<NpmTask>("npm_run_build") {
    dependsOn("npmInstall")
    inputs.dir("src")
    inputs.dir("public")
    inputs.file("package.json")
    inputs.file("package-lock.json")
    inputs.file("tsconfig.json")
    inputs.file("tsconfig.app.json")
    inputs.file("tsconfig.node.json")
    inputs.file("vite.config.ts")
    inputs.file("index.html")

    outputs.dir("dist")
}

tasks.register<com.github.gradle.node.npm.task.NpmTask>("run") {
    group = "application"
    description = "Runs the frontend development server."
    dependsOn("npmInstall")
    args.set(listOf("run", "dev"))
}

tasks.named("assemble") {
    dependsOn("npm_run_build")
}

tasks.register<NpmTask>("testUnit") {
    group = "verification"
    description = "Runs unit tests with coverage."
    dependsOn("npmInstall")
    args.set(listOf("run", "test:coverage"))
}

tasks.register<NpmTask>("testE2e") {
    group = "verification"
    description = "Runs e2e tests with Playwright."
    dependsOn("npmInstall")
    args.set(listOf("run", "test:e2e"))
}

tasks.named("check") {
    dependsOn("testUnit")
    dependsOn("testE2e")
}

