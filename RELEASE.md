# 发布指南

## 自动发布（推荐）

项目配置了 GitHub Actions 自动构建和发布。

### 步骤：

1. **更新版本号**
   
   编辑 `package.json`，更新 `version` 字段：
   ```json
   "version": "1.0.1"
   ```

2. **提交更改**
   ```bash
   git add .
   git commit -m "chore: bump version to 1.0.1"
   git push
   ```

3. **创建并推送标签**
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

4. **等待构建完成**
   
   - 访问 GitHub 仓库的 Actions 页面
   - 等待构建完成（约 10-15 分钟）
   - 构建成功后会自动创建 Release

5. **编辑 Release 说明**
   
   - 访问 Releases 页面
   - 编辑自动创建的 Release
   - 添加更新日志和说明

### 自动生成的文件：

- `Kitty-Reminder-Windows-x64.zip` - Windows 版本
- `Kitty-Reminder-macOS-x64.zip` - macOS Intel 版本
- `Kitty-Reminder-macOS-arm64.zip` - macOS Apple Silicon 版本
- `Kitty-Reminder-Linux-x64.tar.gz` - Linux 版本

## 手动发布

如果需要手动构建和发布：

### Windows

```bash
npm run package:win
# 打包文件位于: release/Kitty Reminder-win32-x64/
```

### macOS

```bash
npm run package:mac
# 打包文件位于: 
# - release/Kitty Reminder-darwin-x64/
# - release/Kitty Reminder-darwin-arm64/
```

### Linux

```bash
npm run package:linux
# 打包文件位于: release/Kitty Reminder-linux-x64/
```

### 全平台

```bash
npm run package:all
```

## 版本号规范

遵循语义化版本（Semantic Versioning）：

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

示例：
- `v1.0.0` - 首次发布
- `v1.0.1` - Bug 修复
- `v1.1.0` - 新功能
- `v2.0.0` - 重大更新

## 发布检查清单

发布前确认：

- [ ] 更新 `package.json` 中的版本号
- [ ] 更新 `README.md` 中的版本信息（如有）
- [ ] 测试所有功能正常工作
- [ ] 检查是否有未提交的更改
- [ ] 编写更新日志
- [ ] 创建并推送标签

## 故障排除

### 构建失败

1. 检查 GitHub Actions 日志
2. 确认所有依赖都在 `package.json` 中
3. 确认图标文件存在

### Release 未创建

1. 确认标签格式正确（必须以 `v` 开头）
2. 检查 GitHub Actions 权限设置
3. 查看 Actions 页面的错误信息

## 注意事项

- macOS 版本需要在 macOS 系统上签名才能避免安全警告
- Windows 版本可能需要代码签名证书
- 首次发布建议使用 `v1.0.0` 作为起始版本
