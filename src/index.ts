import AWS from "aws-sdk"

const ecr = new AWS.ECR()
const core = require("@actions/core")

const ECR_IMAGESCAN_WAIT_SEC: number = 10

const sleep = (waitSecounds: number) =>
  new Promise(resolve => setTimeout(resolve, waitSecounds * 1000))

export async function main() {
  try {
    const imageDigest = core.getInput("image-digest", { required: true })
    const imageTag = core.getInput("image-tag", { required: true })
    const repositoryName = core.getInput("repository-name", { required: true })
    const triggerSeverity = core.getInput("trigger-severity", { required: true })
    if (
      !(
        triggerSeverity === "INFORMATIONAL" ||
        triggerSeverity === "LOW" ||
        triggerSeverity === "MEDIUM" ||
        triggerSeverity === "HIGH" ||
        triggerSeverity === "CRITICAL"
      )
    ) {
      throw new Error("trigger-severity: INFORMATIONAL | LOW | MEDIUM | HIGH | CRITICAL")
    }

    const imageParams = {
      imageId: {
        imageDigest,
        imageTag
      },
      repositoryName
    }

    // start Image Scan
    const startImageScan = await ecr.startImageScan(imageParams).promise()
    core.info(startImageScan)
    console.log(startImageScan)

    while (true) {
      await sleep(ECR_IMAGESCAN_WAIT_SEC)
      const imageScanResult = await ecr.describeImageScanFindings(imageParams).promise()
      core.info(imageScanResult)
      console.log(imageScanResult)

      if (imageScanResult.imageScanStatus?.status === "FAILED") {
        throw new Error(`ImageScanResult FAILED.  ${imageScanResult.imageScanStatus.description}`)
      }

      if (imageScanResult.imageScanStatus?.status === "COMPLETE") {
        //@ts-ignore
        if (!(imageScanResult.imageScanFindings?.findingSeverityCounts[triggerSeverity] != null)) {
          break
        } else {
          throw new Error(`Find Vulnerability ￿\n ${JSON.stringify(imageScanResult)}`)
        }
      }
    }
  } catch (error) {
    core.debug(error)
    console.log(error)
    core.setFailed(error.message)
  }
}

main()
