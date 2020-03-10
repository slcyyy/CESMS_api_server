define({ "api": [
  {
    "type": "get",
    "url": "/grade/selectList",
    "title": "获取评分表的下拉框数据",
    "name": "GetSelectList",
    "group": "Grade",
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "  HTTP/1.1 200 OK\n  {\n   \"selectList\": [\n    {\n        \"id\": 1,\n        \"label\": \"国服\",\n        \"children\": [\n            {\n                \"id\": 1,\n                \"label\": \"1 安全基础管理安全风险隐患排查表\"\n            },\n            {\n                \"id\": 2,\n                \"label\": \"2 设计与总图安全风险隐患排查表\"\n            }\n        ]\n    },\n    {\n        \"id\": 2,\n        \"label\": \"阿里\",\n        \"children\": [\n            {\n                 \"id\": 1,\n                   \"label\": \"1 安全基础管理安全风险隐患排查表\"\n            },\n            {\n                \"id\": 2,\n                \"label\": \"2 设计与总图安全风险隐患排查表\"\n            }\n        ]\n    }\n],\n\"meta\": {\n    \"err\": 0,\n    \"msg\": \"查询级联选择框数据成功\"\n}\n  }",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found\n{\n  meta:{err:-1,msg:'查询级联选择框数据失败'}\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/gradeRouter.js",
    "groupTitle": "Grade"
  },
  {
    "type": "get",
    "url": "/user/:email/:pwd",
    "title": "Sign in",
    "name": "Login",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Users unique email.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "pwd",
            "description": "<p>Users password.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/usersRouter.js",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/user/:name/:pwd/:email/:code",
    "title": "Sign up",
    "name": "Register",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Users name.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "pwd",
            "description": "<p>Users password.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Users unique email.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "roleId",
            "description": "<p>Users role.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "code",
            "description": "<p>Users code.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/usersRouter.js",
    "groupTitle": "User"
  }
] });
