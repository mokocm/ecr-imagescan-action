# ecr-imagescan-action



```yml
- name: Image Scan
  id: image-scan
  uses: mokocm/ecr-imagescan-action@v3
  with:
    image-digest: "Image Digest(sha256)(Required)"
    image-tag: "Image Tag(Requred)"
    repository-name: "ECR Repository Name (Required)"
    trigger-severity: "INFORMATIONAL | LOW | MEDIUM | HIGH | CRITICAL (Required)"
```

[[テンプレート公開]GitHub ActionsでECRのイメージスキャンでCI/CDするワークフローを組んでみた](https://dev.classmethod.jp/cloud/aws/ecr-imagescan-ci-cd-github-actions/)

