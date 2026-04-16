---
hide:
  - navigation
  - toc
---

# API Reference

Complete REST API documentation with all endpoints, request/response schemas, and examples.

<div id="redoc-container"></div>

<script src="https://cdn.jsdelivr.net/npm/redoc@latest/bundles/redoc.standalone.js"></script>
<script>
  Redoc.init('../openapi.yaml', {
    expandResponses: '200,201',
    requiredPropsFirst: true,
    scrollYOffset: 60,
    hideDownloadButton: true,
    theme: {
      colors: {
        primary: {
          main: '#3f51b5'
        }
      }
    }
  }, document.getElementById('redoc-container'))
</script>
