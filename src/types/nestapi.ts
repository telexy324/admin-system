/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface LoginToken {
  /** JWT身份Token */
  token: string;
}

export interface LoginDto {
  /**
   * 手机号/邮箱
   * @minLength 4
   */
  username: string;
  /**
   * 密码
   * @minLength 6
   * @pattern /^\S*(?=\S{6})(?=\S*\d)(?=\S*[A-Z])\S*$/i
   * @example "a123456"
   */
  password: string;
  /** 验证码标识 */
  captchaId?: string;
  /**
   * 用户输入的验证码
   * @minLength 4
   * @maxLength 4
   */
  verifyCode?: string;
}

export interface RegisterDto {
  /** 账号 */
  username: string;
  /**
   * 密码
   * @minLength 6
   * @maxLength 16
   * @pattern /^\S*(?=\S{6})(?=\S*\d)(?=\S*[A-Z])\S*$/i
   */
  password: string;
  /** 语言 */
  lang: string;
}

export interface AccountInfo {
  /** 用户名 */
  username: string;
  /** 昵称 */
  nickname: string;
  /** 邮箱 */
  email: string;
  /** 手机号 */
  phone: string;
  /** 备注 */
  remark: string;
  /** 头像 */
  avatar: string;
  /** 是否管理员 */
  isAdmin: boolean;
}

export interface MenuMeta {
  /** 创建者 */
  creator?: string;
  /** 更新者 */
  updater?: string;
  title: string;
  permission?: string;
  type?: number;
  icon?: string;
  orderNo?: number;
  component?: string;
  isExt?: boolean;
  extOpenMode?: number;
  keepAlive?: number;
  show?: number;
  activeMenu?: string;
  status?: number;
}

export interface AccountMenus {
  meta: MenuMeta;
  id: number;
  path: string;
  name: string;
  component: string;
}

export type String = object;

export interface AccountUpdateDto {
  /** 用户呢称 */
  nickname: string;
  /**
   * 用户邮箱
   * @format email
   */
  email: string;
  /**
   * 用户QQ
   * @minLength 5
   * @maxLength 11
   * @pattern /^\d+$/
   */
  qq: string;
  /** 用户手机号 */
  phone: string;
  /** 用户头像 */
  avatar: string;
  /** 用户备注 */
  remark: string;
}

export interface PasswordUpdateDto {
  /**
   * 旧密码
   * @minLength 6
   * @maxLength 20
   * @pattern /^[\s\S]+$/
   */
  oldPassword: string;
  /**
   * 新密码
   * @pattern /^\S*(?=\S{6})(?=\S*\d)(?=\S*[A-Z])\S*$/i
   */
  newPassword: string;
}

export interface ImageCaptcha {
  /** base64格式的svg图片 */
  img: string;
  /** 验证码对应的唯一ID */
  id: string;
}

export interface SendEmailCodeDto {
  /**
   * 邮箱
   * @format email
   */
  email: string;
}

export interface RoleEntity {
  /** 创建者 */
  creator: string;
  /** 更新者 */
  updater: string;
  /** 角色名 */
  name: string;
  /** 角色标识 */
  value: string;
  /** 角色描述 */
  remark: string;
  /** 状态：1启用，0禁用 */
  status: number;
  /** 是否默认用户 */
  default: boolean;
  id: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface DeptEntity {
  /** 创建者 */
  creator: string;
  /** 更新者 */
  updater: string;
  /** 部门名称 */
  name: string;
  /** 排序 */
  orderNo: number;
  children: DeptEntity[];
  parent?: DeptEntity;
  id: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface RefreshTokenEntity {
  id: string;
  value: string;
  /** @format date-time */
  expired_at: string;
  /** @format date-time */
  created_at: string;
  accessToken: AccessTokenEntity;
}

export interface UserEntity {
  username: string;
  password: string;
  psalt: string;
  nickname: string;
  avatar: string;
  qq: string;
  email: string;
  phone: string;
  remark: string;
  status: number;
  roles: RoleEntity[];
  dept: DeptEntity;
  accessTokens: AccessTokenEntity[];
  id: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface AccessTokenEntity {
  id: string;
  value: string;
  /** @format date-time */
  expired_at: string;
  /** @format date-time */
  created_at: string;
  refreshToken: RefreshTokenEntity;
  user: UserEntity;
}

export interface UserDto {
  /** 头像 */
  avatar?: string;
  /**
   * 登录账号
   * @minLength 4
   * @maxLength 20
   * @pattern /^[\s\S]+$/
   * @example "admin"
   */
  username: string;
  /**
   * 登录密码
   * @pattern /^\S*(?=\S{6})(?=\S*\d)(?=\S*[A-Z])\S*$/i
   * @example "a123456"
   */
  password: string;
  /**
   * 归属角色
   * @maxItems 3
   * @minItems 1
   */
  roleIds: number[];
  /** 归属大区 */
  deptId?: number;
  /**
   * 呢称
   * @example "admin"
   */
  nickname: string;
  /**
   * 邮箱
   * @format email
   * @example "bqy.dev@qq.com"
   */
  email: string;
  /** 手机号 */
  phone?: string;
  /**
   * QQ
   * @minLength 5
   * @maxLength 11
   * @pattern /^[1-9]\d{4,10}$/
   */
  qq?: string;
  /** 备注 */
  remark?: string;
  /** 状态 */
  status: 0 | 1;
}

export interface UserUpdateDto {
  /** 头像 */
  avatar?: string;
  /**
   * 登录账号
   * @minLength 4
   * @maxLength 20
   * @pattern /^[\s\S]+$/
   * @example "admin"
   */
  username?: string;
  /**
   * 登录密码
   * @pattern /^\S*(?=\S{6})(?=\S*\d)(?=\S*[A-Z])\S*$/i
   * @example "a123456"
   */
  password?: string;
  /**
   * 归属角色
   * @maxItems 3
   * @minItems 1
   */
  roleIds?: number[];
  /** 归属大区 */
  deptId?: number;
  /**
   * 呢称
   * @example "admin"
   */
  nickname?: string;
  /**
   * 邮箱
   * @format email
   * @example "bqy.dev@qq.com"
   */
  email?: string;
  /** 手机号 */
  phone?: string;
  /**
   * QQ
   * @minLength 5
   * @maxLength 11
   * @pattern /^[1-9]\d{4,10}$/
   */
  qq?: string;
  /** 备注 */
  remark?: string;
  /** 状态 */
  status?: 0 | 1;
}

export interface UserPasswordDto {
  /**
   * 更改后的密码
   * @pattern /^\S*(?=\S{6})(?=\S*\d)(?=\S*[A-Z])\S*$/i
   */
  password: string;
}

export interface RoleInfo {
  /** 创建者 */
  creator: string;
  /** 更新者 */
  updater: string;
  /** 角色名 */
  name: string;
  /** 角色标识 */
  value: string;
  /** 角色描述 */
  remark: string;
  /** 状态：1启用，0禁用 */
  status: number;
  /** 是否默认用户 */
  default: boolean;
  menuIds: number[];
  id: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface RoleDto {
  /**
   * 角色名称
   * @minLength 2
   */
  name: string;
  /**
   * 角色标识
   * @minLength 2
   * @pattern /^[a-z0-9]+$/i
   */
  value: string;
  /** 角色备注 */
  remark?: string;
  /** 状态 */
  status: 0 | 1;
  /** 关联菜单、权限编号 */
  menuIds?: number[];
}

export interface RoleUpdateDto {
  /**
   * 角色名称
   * @minLength 2
   */
  name?: string;
  /**
   * 角色标识
   * @minLength 2
   * @pattern /^[a-z0-9]+$/i
   */
  value?: string;
  /** 角色备注 */
  remark?: string;
  /** 状态 */
  status?: 0 | 1;
  /** 关联菜单、权限编号 */
  menuIds?: number[];
}

export interface MenuItemInfo {
  /** 创建者 */
  creator: string;
  /** 更新者 */
  updater: string;
  children: MenuItemInfo[];
  parentId: number;
  name: string;
  path: string;
  permission: string;
  type: number;
  icon: string;
  orderNo: number;
  component: string;
  isExt: boolean;
  extOpenMode: number;
  keepAlive: number;
  show: number;
  activeMenu: string;
  status: number;
  roles: RoleEntity[];
  id: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface MenuDto {
  /**
   *
   * 菜单类型:
   * - 0: 菜单
   * - 1: 目录
   * - 2: 权限
   *
   */
  type: 0 | 1 | 2;
  /** 父级菜单 */
  parentId: number;
  /**
   * 菜单或权限名称
   * @minLength 2
   */
  name: string;
  /**
   * 排序
   * @min 0
   */
  orderNo: number;
  /** 前端路由地址 */
  path: string;
  /**
   * 是否外链
   * @default false
   */
  isExt: boolean;
  /**
   * 外链打开方式
   * @default 1
   */
  extOpenMode: 1 | 2;
  /**
   * 菜单是否显示
   * @default 1
   */
  show: 0 | 1;
  /** 设置当前路由高亮的菜单项，一般用于详情页 */
  activeMenu?: string;
  /**
   * 是否开启页面缓存
   * @default 1
   */
  keepAlive: 0 | 1;
  /**
   * 状态
   * @default 1
   */
  status: 0 | 1;
  /** 菜单图标 */
  icon?: string;
  /** 对应权限 */
  permission: string;
  /** 菜单路由路径或外链 */
  component?: string;
}

export interface MenuUpdateDto {
  /**
   *
   * 菜单类型:
   * - 0: 菜单
   * - 1: 目录
   * - 2: 权限
   *
   */
  type?: 0 | 1 | 2;
  /** 父级菜单 */
  parentId?: number;
  /**
   * 菜单或权限名称
   * @minLength 2
   */
  name?: string;
  /**
   * 排序
   * @min 0
   */
  orderNo?: number;
  /** 前端路由地址 */
  path?: string;
  /**
   * 是否外链
   * @default false
   */
  isExt?: boolean;
  /**
   * 外链打开方式
   * @default 1
   */
  extOpenMode?: 1 | 2;
  /**
   * 菜单是否显示
   * @default 1
   */
  show?: 0 | 1;
  /** 设置当前路由高亮的菜单项，一般用于详情页 */
  activeMenu?: string;
  /**
   * 是否开启页面缓存
   * @default 1
   */
  keepAlive?: 0 | 1;
  /**
   * 状态
   * @default 1
   */
  status?: 0 | 1;
  /** 菜单图标 */
  icon?: string;
  /** 对应权限 */
  permission?: string;
  /** 菜单路由路径或外链 */
  component?: string;
}

export interface ParamConfigEntity {
  /** 配置名 */
  name: string;
  /** 配置键名 */
  key: string;
  /** 配置值 */
  value: string;
  /** 配置描述 */
  remark: string;
  id: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface ParamConfigDto {
  /** 参数名称 */
  name: string;
  /**
   * 参数键名
   * @minLength 3
   */
  key: string;
  /** 参数值 */
  value: string;
  /** 备注 */
  remark?: string;
}

export interface LoginLogInfo {
  /** 日志编号 */
  id: number;
  /**
   * 登录ip
   * @example "1.1.1.1"
   */
  ip: string;
  /** 登录地址 */
  address: string;
  /**
   * 系统
   * @example "Windows 10"
   */
  os: string;
  /**
   * 浏览器
   * @example "Chrome"
   */
  browser: string;
  /**
   * 登录用户名
   * @example "admin"
   */
  username: string;
  /**
   * 登录时间
   * @example "2023-12-22 16:46:20.333843"
   */
  time: string;
}

export interface TaskEntity {
  /** 任务名 */
  name: string;
  /** 任务标识 */
  service: string;
  /** 任务类型 0cron 1间隔 */
  type: number;
  /** 任务状态 0禁用 1启用 */
  status: number;
  /**
   * 开始时间
   * @format date-time
   */
  startTime: string;
  /**
   * 结束时间
   * @format date-time
   */
  endTime: string;
  /** 间隔时间 */
  limit: number;
  /** cron表达式 */
  cron: string;
  /** 执行次数 */
  every: number;
  /** 任务参数 */
  data: string;
  /** 任务配置 */
  jobOpts: string;
  /** 任务描述 */
  remark: string;
  id: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface TaskLogEntity {
  /** 任务状态：0失败，1成功 */
  status: number;
  /** 任务日志信息 */
  detail: string;
  /** 任务耗时 */
  consumeTime: number;
  task: TaskEntity;
  id: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface CaptchaLogEntity {
  /** 用户ID */
  userId: number;
  /** 账号 */
  account: string;
  /** 验证码 */
  code: string;
  /** 验证码提供方 */
  provider: object;
  id: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface DeptDto {
  /**
   * 部门名称
   * @minLength 1
   */
  name: string;
  /** 父级部门id */
  parentId: number;
  /**
   * 排序编号
   * @min 0
   */
  orderNo?: number;
}

export interface DictTypeEntity {
  /** 创建者 */
  creator: string;
  /** 更新者 */
  updater: string;
  /** 字典名称 */
  name: string;
  /** 字典编码 */
  code: string;
  /**  状态 */
  status: number;
  /** 备注 */
  remark: string;
  id: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface DictTypeDto {
  /** 创建者 */
  creator?: string;
  /** 更新者 */
  updater?: string;
  /**
   * 字典类型名称
   * @minLength 1
   */
  name?: string;
  /**
   * 字典类型code
   * @minLength 3
   */
  code?: string;
  /** 状态 */
  status?: number;
  /** 备注 */
  remark?: string;
  id?: number;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
}

export interface DictItemEntity {
  /** 创建者 */
  creator: string;
  /** 更新者 */
  updater: string;
  /** 字典项键名 */
  label: string;
  /** 字典项值 */
  value: string;
  /**  状态 */
  status: number;
  /** 备注 */
  remark: string;
  type: DictTypeEntity;
  orderNo: number;
  id: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface DictItemDto {
  /** 创建者 */
  creator?: string;
  /** 更新者 */
  updater?: string;
  /**
   * 字典项键名
   * @minLength 1
   */
  label?: string;
  /**
   * 字典项值
   * @minLength 1
   */
  value?: string;
  /** 状态 */
  status?: number;
  /** 备注 */
  remark?: string;
  /** 字典类型 ID */
  typeId: number;
  id?: number;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
  type?: DictTypeEntity;
  orderNo?: number;
}

export interface TaskDto {
  /**
   * 任务名称
   * @minLength 2
   * @maxLength 50
   */
  name: string;
  /**
   * 调用的服务
   * @minLength 1
   */
  service: string;
  /** 任务类别：cron | interval */
  type: 0 | 1;
  /** 任务状态 */
  status: 0 | 1;
  /**
   * 开始时间
   * @format date-time
   */
  startTime?: string;
  /**
   * 结束时间
   * @format date-time
   */
  endTime?: string;
  /**
   * 限制执行次数，负数则无限制
   * @default -1
   */
  limit?: number;
  /** cron表达式 */
  cron: string;
  /**
   * 执行间隔，毫秒单位
   * @min 100
   */
  every?: number;
  /** 执行参数 */
  data?: string;
  /** 任务备注 */
  remark?: string;
}

export interface TaskUpdateDto {
  /**
   * 任务名称
   * @minLength 2
   * @maxLength 50
   */
  name?: string;
  /**
   * 调用的服务
   * @minLength 1
   */
  service?: string;
  /** 任务类别：cron | interval */
  type?: 0 | 1;
  /** 任务状态 */
  status?: 0 | 1;
  /**
   * 开始时间
   * @format date-time
   */
  startTime?: string;
  /**
   * 结束时间
   * @format date-time
   */
  endTime?: string;
  /**
   * 限制执行次数，负数则无限制
   * @default -1
   */
  limit?: number;
  /** cron表达式 */
  cron?: string;
  /**
   * 执行间隔，毫秒单位
   * @min 100
   */
  every?: number;
  /** 执行参数 */
  data?: string;
  /** 任务备注 */
  remark?: string;
}

export interface OnlineUserInfo {
  /**
   * 登录ip
   * @example "1.1.1.1"
   */
  ip: string;
  /** 登录地址 */
  address: string;
  /**
   * 系统
   * @example "Windows 10"
   */
  os: string;
  /**
   * 浏览器
   * @example "Chrome"
   */
  browser: string;
  /**
   * 登录用户名
   * @example "admin"
   */
  username: string;
  /**
   * 登录时间
   * @example "2023-12-22 16:46:20.333843"
   */
  time: string;
  /** tokenId */
  tokenId: string;
  /** 部门名称 */
  deptName: string;
  /** 用户ID */
  uid: number;
  /** 是否为当前登录用户 */
  isCurrent: boolean;
  /** 不允许踢当前用户或超级管理员下线 */
  disable: boolean;
}

export interface KickDto {
  /** tokenId */
  tokenId: string;
}

export interface Runtime {
  /** 系统 */
  os: string;
  /** 服务器架构 */
  arch: string;
  /** Node版本 */
  nodeVersion: string;
  /** Npm版本 */
  npmVersion: string;
}

export interface CoreLoad {
  /** 当前CPU资源消耗 */
  rawLoad: number;
  /** 当前空闲CPU资源 */
  rawLoadIdle: number;
}

export interface Cpu {
  /** 制造商 */
  manufacturer: string;
  /** 品牌 */
  brand: string;
  /** 物理核心数 */
  physicalCores: number;
  /** 型号 */
  model: string;
  /** 速度 in GHz */
  speed: number;
  /** CPU资源消耗 原始滴答 */
  rawCurrentLoad: number;
  /** 空闲CPU资源 原始滴答 */
  rawCurrentLoadIdle: number;
  /** cpu资源消耗 */
  coresLoad: CoreLoad[];
}

export interface Disk {
  /** 磁盘空间大小 (bytes) */
  size: number;
  /** 已使用磁盘空间 (bytes) */
  used: number;
  /** 可用磁盘空间 (bytes) */
  available: number;
}

export interface Memory {
  /** total memory in bytes */
  total: number;
  /** 可用内存 */
  available: number;
}

export interface ServeStatInfo {
  /** 运行环境 */
  runtime: Runtime;
  /** CPU信息 */
  cpu: Cpu;
  /** 磁盘信息 */
  disk: Disk;
  /** 内存信息 */
  memory: Memory;
}

export interface StorageInfo {
  /** 文件ID */
  id: number;
  /** 文件名 */
  name: string;
  /** 文件扩展名 */
  extName: string;
  /** 文件路径 */
  path: string;
  /** 文件类型 */
  type: string;
  /** 大小 */
  size: string;
  /** 上传时间 */
  createdAt: string;
  /** 上传者 */
  username: string;
}

export interface StorageDeleteDto {
  /**
   * 需要删除的文件ID列表
   * @minItems 1
   */
  ids: number[];
}

export interface EmailSendDto {
  /**
   * 收件人邮箱
   * @format email
   */
  to: string;
  /** 标题 */
  subject: string;
  /** 正文 */
  content: string;
}

export interface FileUploadDto {
  /**
   * 文件
   * @format binary
   */
  file: File;
}

export interface Storage {
  /** 文件名 */
  name: string;
  /** 真实文件名 */
  fileName: string;
  /** 扩展名 */
  extName: string;
  /** 文件类型 */
  path: string;
  /** 文件类型 */
  type: string;
  /** 文件大小 */
  size: string;
  /** 用户ID */
  userId: number;
  leave: LeaveEntity | null;
  id: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface LeaveEntity {
  /** status: 1:PENDING, 2:APPROVED, 3:REJECTED, 4:CANCELLED */
  status: number;
  /** type: 1:COMPENSATE, 2:ANNUAL, 3:SICK, 4:PERSONAL, 5:OTHER */
  type: number;
  /**
   * 开始时间
   * @format date-time
   */
  startDate: string;
  /**
   * 结束时间
   * @format date-time
   */
  endDate: string;
  amount: string;
  reason: string;
  proof: Storage[];
  user: UserEntity;
  approver: UserEntity;
  comment: string;
  /** @format date-time */
  doneAt: string;
  id: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface SFileInfo {
  /** 文件id */
  id: string;
  /** 文件类型 */
  type: "file" | "dir";
  /** 文件名称 */
  name: string;
  /**
   * 存入时间
   * @format date-time
   */
  putTime: string;
  /** 文件大小, byte单位 */
  fsize: string;
  /** 文件的mime-type */
  mimeType: string;
  /** 所属目录 */
  belongTo: string;
}

export interface SFileList {
  /** 文件列表 */
  list: SFileInfo[];
  /** 分页标志，空则代表加载完毕 */
  marker: string;
}

export interface MKDirDto {
  /** 文件夹名称 */
  dirName: string;
  /** 所属路径 */
  path: string;
}

export interface UploadToken {
  /** 上传token */
  token: string;
}

export interface SFileInfoDetail {
  /** 文件大小，int64类型，单位为字节（Byte） */
  fsize: number;
  /** 文件HASH值 */
  hash: string;
  /** 文件MIME类型，string类型 */
  mimeType: string;
  /** 文件存储类型，2 表示归档存储，1 表示低频存储，0表示普通存储。 */
  type: number;
  /**
   * 文件上传时间
   * @format date-time
   */
  putTime: string;
  /** 文件md5值 */
  md5: string;
  /** 上传人 */
  uploader: string;
  /** 文件备注 */
  mark: string;
}

export interface MarkFileDto {
  /** 文件名 */
  name: string;
  /** 文件所在路径 */
  path: string;
  /** 备注信息 */
  mark: string;
}

export interface RenameDto {
  /**
   * 文件类型
   * @pattern /(^file$)|(^dir$)/
   */
  type: string;
  /** 更改的名称 */
  toName: string;
  /** 原来的名称 */
  name: string;
  /** 路径 */
  path: string;
}

export interface FileOpItem {
  /**
   * 文件类型
   * @pattern /(^file$)|(^dir$)/
   */
  type: "file" | "dir";
  /** 文件名称 */
  name: string;
}

export interface DeleteDto {
  /** 需要操作的文件或文件夹 */
  files: FileOpItem[];
  /** 所在目录 */
  path: string;
}

export interface FileOpDto {
  /** 需要操作的文件或文件夹 */
  files: FileOpItem[];
  /** 操作前的目录 */
  originPath: string;
  /** 操作后的目录 */
  toPath: string;
}

export interface FlowInfo {
  /** 当月的X号 */
  times: number[];
  /** 对应天数的耗费流量 */
  datas: number[];
}

export interface SpaceInfo {
  /** 当月的X号 */
  times: number[];
  /** 对应天数的容量, byte单位 */
  datas: number[];
}

export interface OverviewSpaceInfo {
  /** 当前使用容量 */
  spaceSize: number;
  /** 当前文件数量 */
  fileSize: number;
  /** 当天使用流量 */
  flowSize: number;
  /** 当天请求次数 */
  hitSize: number;
  /** 流量趋势，从当月1号开始计算 */
  flowTrend: FlowInfo;
  /** 容量趋势，从当月1号开始计算 */
  sizeTrend: SpaceInfo;
}

export interface TodoEntity {
  /** todo */
  value: string;
  /** todo */
  status: boolean;
  user: UserEntity;
  id: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface TodoDto {
  /** 名称 */
  value: string;
}

export interface TodoUpdateDto {
  /** 名称 */
  value?: string;
}

export interface LeaveDto {
  /** 申请时长 */
  amount: string;
  /**
   *
   * 请假类型:
   * - 1: 调休
   * - 2: 年假
   * - 3: 病假
   * - 4: 事假
   * - 5: 其他
   *
   */
  type: 1 | 2 | 3 | 4 | 5;
  /**
   * 开始时间
   * @pattern /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
   * @example "2025-04-30 15:30:00"
   */
  startDate: string;
  /**
   * 结束时间
   * @pattern /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
   * @example "2025-04-30 17:45:00"
   */
  endDate: string;
  /**
   * 请假事由
   * @minLength 8
   */
  reason: string;
  /** 请假佐证 */
  proof?: number[];
  /** 评论 */
  comment?: string;
  /**
   *
   * 状态:
   * - 1: 等待
   * - 2: 批准
   * - 3: 驳回
   * - 4: 取消
   *
   */
  status: 1 | 2 | 3 | 4;
}

export interface LeaveUpdateDto {
  /** 申请时长 */
  amount?: string;
  /**
   *
   * 请假类型:
   * - 1: 调休
   * - 2: 年假
   * - 3: 病假
   * - 4: 事假
   * - 5: 其他
   *
   */
  type?: 1 | 2 | 3 | 4 | 5;
  /**
   * 开始时间
   * @pattern /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
   * @example "2025-04-30 15:30:00"
   */
  startDate?: string;
  /**
   * 结束时间
   * @pattern /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
   * @example "2025-04-30 17:45:00"
   */
  endDate?: string;
  /**
   * 请假事由
   * @minLength 8
   */
  reason?: string;
  /** 请假佐证 */
  proof?: number[];
  /** 评论 */
  comment?: string;
  /**
   *
   * 状态:
   * - 1: 等待
   * - 2: 批准
   * - 3: 驳回
   * - 4: 取消
   *
   */
  status?: 1 | 2 | 3 | 4;
}

export interface LeaveStats {
  /** 调休总天数 */
  totalCompensatoryLeaves: number;
  /** 调休已使用天数 */
  usedCompensatoryLeaves: number;
  /** 年假总天数 */
  totalAnnualLeaves: number;
  /** 年假已使用天数 */
  usedAnnualLeaves: number;
  /** 病假总天数 */
  totalSickLeaves: number;
  /** 病假已使用天数 */
  usedSickLeaves: number;
  /** 事假总天数 */
  totalPersonalLeaves: number;
  /** 事假已使用天数 */
  usedPersonalLeaves: number;
}

export interface LeaveApprovalStats {
  /** 未审批请求 */
  totalUnApproveLeaves: number;
  /** 已审批请求 */
  totalApprovedLeaves: number;
  /** 已通过请求 */
  totalApprovalLeaves: number;
  /** 已拒绝请求 */
  totalRejectLeaves: number;
}

export interface LeaveBalanceEntity {
  /** status: 1:COMPENSATE, 2:ANNUAL, 3:SICK, 4:PERSONAL, 5:OTHER */
  type: number;
  /** 年度 */
  year: number;
  /** status: 1:REQUEST, 2:CANCEL */
  action: number;
  amount: string;
  user: UserEntity;
  id: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface LeaveBalanceDto {
  /** 申请时长 */
  amount: string;
  /**
   *
   * 请假类型:
   * - 1: 调休
   * - 2: 年假
   * - 3: 病假
   * - 4: 事假
   * - 5: 其他
   *
   */
  type: 1 | 2 | 3 | 4 | 5;
  /**
   * 开始时间
   * @pattern /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
   * @example "2025-04-30 15:30:00"
   */
  startDate: string;
  /**
   * 结束时间
   * @pattern /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
   * @example "2025-04-30 17:45:00"
   */
  endDate: string;
  /**
   * 请假事由
   * @minLength 8
   */
  reason: string;
  /** 请假佐证 */
  proof?: string;
  /** 评论 */
  comment?: string;
}

export interface LeaveBalanceUpdateDto {
  /** 申请时长 */
  amount?: string;
  /**
   *
   * 请假类型:
   * - 1: 调休
   * - 2: 年假
   * - 3: 病假
   * - 4: 事假
   * - 5: 其他
   *
   */
  type?: 1 | 2 | 3 | 4 | 5;
  /**
   * 开始时间
   * @pattern /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
   * @example "2025-04-30 15:30:00"
   */
  startDate?: string;
  /**
   * 结束时间
   * @pattern /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
   * @example "2025-04-30 17:45:00"
   */
  endDate?: string;
  /**
   * 请假事由
   * @minLength 8
   */
  reason?: string;
  /** 请假佐证 */
  proof?: string;
  /** 评论 */
  comment?: string;
}

export interface CommonEntity {
  id: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface ResOp {
  data: Record<string, any>;
  /** @default 200 */
  code: number;
  /** @default "success" */
  message: string;
}

export type Pagination = object;

export interface TreeResult {
  id: number;
  parentId: number;
  children: string[];
}
