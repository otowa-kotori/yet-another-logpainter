import { test, expect } from '@playwright/test';

test('smoke1', async ({ page }) => {
  await page.goto("https://otowa-kotori.github.io/yet-another-logpainter/", {"waitUntil": "networkidle"})
  await expect(page.getByRole('button', { name: '预览' })).toBeVisible();
  await page.getByRole('textbox', { name: '在此粘贴QQ记录，支持拖放txt文件' }).click();
  await page.getByRole('textbox', { name: '在此粘贴QQ记录，支持拖放txt文件' }).fill('2023-04-28 17:58:21 Alice(10001)\n今天的天气真不错，适合出去散步\n\n2023-04-28 17:58:44 Bob(10002)\n是啊，我刚刚还在想要不要去公园走走\n\n2023-04-28 17:59:19 Alice(10001)\n公园里有新开的花展，听说很不错\n\n2023-04-28 18:00:58 Bob(10002)\n那我们一起去看看吧，顺便拍些照片\n\n2023-04-28 18:02:26 Alice(10001)\n好主意！我带上相机\n\n2023-04-28 18:03:14 Bob(10002)\n太好了，期待\n\n2023-04-28 18:04:32 Alice(10001)\n我已经准备好了，随时可以出发\n\n2023-04-28 19:25:23 Clair(10003)\n[图片]\n\n2023-04-28 20:01:01 Dave(10004)\n你们看过这部电影吗？ /me 盯\n\n2023-04-28 20:03:04 游客1(10009)\n飘过~\n\n2023-04-28 21:52:30 Eva(10005)\n你们周末有什么计划吗？\n\n2023-04-28 21:54:13 Bob(10002)\n我打算去爬山\n\n2023-04-28 21:55:38 Eva(10005)\n听起来不错，我可能会去海边\n\n2023-04-28 21:56:27 Bob(10002)\n海边也很棒，记得带防晒霜\n\n2023-04-28 21:56:33 Bob(10002)\n（还有泳衣）\n\n2023-04-28 21:57:10 Eva(10005)\n当然，我已经准备好了\n\n2023-04-28 21:57:15 Eba(10005)\n周日下午出发\n\n2023-04-28 21:59:00 游客2(10309)\n飘过~\n\n');
  await page.getByRole('button', { name: '转换' }).click();
  await expect(page.getByRole('main')).toContainText('17:58:21 <Alice> 今天的天气真不错，适合出去散步');
  await page.getByRole('button', { name: 'BBCode' }).click();
  await expect(page.getByRole('textbox', { name: '转换后的BBCode将显示在这里' })).toHaveValue('[color=silver]17:58:21[/color][color=#ff0000]<Alice>今天的天气真不错，适合出去散步[/color]\n[color=silver]17:58:44[/color][color=#008000]<Bob>是啊，我刚刚还在想要不要去公园走走[/color]\n[color=silver]17:59:19[/color][color=#ff0000]<Alice>公园里有新开的花展，听说很不错[/color]\n[color=silver]18:00:58[/color][color=#008000]<Bob>那我们一起去看看吧，顺便拍些照片[/color]\n[color=silver]18:02:26[/color][color=#ff0000]<Alice>好主意！我带上相机[/color]\n[color=silver]18:03:14[/color][color=#008000]<Bob>太好了，期待[/color]\n[color=silver]18:04:32[/color][color=#ff0000]<Alice>我已经准备好了，随时可以出发[/color]\n[color=silver]20:01:01[/color][color=#ffc0cb]<Dave>你们看过这部电影吗？[/color]\n[color=silver]20:01:01[/color][color=#ffc0cb]<Dave>Dave盯[/color]\n[color=silver]20:03:04[/color][color=#ffa500]<游客1>飘过~[/color]\n[color=silver]21:52:30[/color][color=#800080]<Eva>你们周末有什么计划吗？[/color]\n[color=silver]21:54:13[/color][color=#008000]<Bob>我打算去爬山[/color]\n[color=silver]21:55:38[/color][color=#800080]<Eva>听起来不错，我可能会去海边[/color]\n[color=silver]21:56:27[/color][color=#008000]<Bob>海边也很棒，记得带防晒霜[/color]\n[color=silver]21:57:10[/color][color=#800080]<Eva>当然，我已经准备好了[/color]\n[color=silver]21:57:15[/color][color=#000000]<Eba>周日下午出发[/color]\n[color=silver]21:59:00[/color][color=#ffff00]<游客2>飘过~[/color]');
  await page.getByRole('button', { name: '颜色管理' }).click();
  await expect(page.locator('.sender-item').first()).toBeVisible();
  await expect(page.locator('div:nth-child(2) > .sender-content > .sender-info > .sender-name-input')).toHaveValue('Bob');
  await page.getByRole('textbox', { name: '在此粘贴颜色配置文本进行导入，或点击导出按钮将当前配置导出到此处，支持拖放txt文件' }).click();
  await page.getByRole('textbox', { name: '在此粘贴颜色配置文本进行导入，或点击导出按钮将当前配置导出到此处，支持拖放txt文件' }).fill('- name: 艾丽丝\n  color: "#ff0000"\n  aliases:\n    - Alice\n- name: BB\n  color: "#008000"\n  aliases:\n    - Bob\n- name: Dave\n  color: "#ffc0cb"\n  aliases: []\n  type: hidden\n- name: Eva\n  color: "#ffa500"\n  aliases:\n    - Eba\n- name: NPC\n  color: "#800080"\n  aliases:\n    - 游客1\n    - 游客2\n  type: preserve_alias\n');
  await page.getByRole('button', { name: '导入' }).click();
  await expect(page.getByRole('textbox', { name: '输入别名，用逗号或空格分隔' }).first()).toHaveValue('Alice');
  await page.getByRole('button', { name: 'BBCode' }).click();
  await page.getByRole('button', { name: '转换' }).click();
  await expect(page.getByRole('textbox', { name: '转换后的BBCode将显示在这里' })).toHaveValue('[color=silver]17:58:21[/color][color=#ff0000]<艾丽丝>今天的天气真不错，适合出去散步[/color]\n[color=silver]17:58:44[/color][color=#008000]<BB>是啊，我刚刚还在想要不要去公园走走[/color]\n[color=silver]17:59:19[/color][color=#ff0000]<艾丽丝>公园里有新开的花展，听说很不错[/color]\n[color=silver]18:00:58[/color][color=#008000]<BB>那我们一起去看看吧，顺便拍些照片[/color]\n[color=silver]18:02:26[/color][color=#ff0000]<艾丽丝>好主意！我带上相机[/color]\n[color=silver]18:03:14[/color][color=#008000]<BB>太好了，期待[/color]\n[color=silver]18:04:32[/color][color=#ff0000]<艾丽丝>我已经准备好了，随时可以出发[/color]\n[color=silver]20:03:04[/color][color=#800080]<游客1>飘过~[/color]\n[color=silver]21:52:30[/color][color=#ffa500]<Eva>你们周末有什么计划吗？[/color]\n[color=silver]21:54:13[/color][color=#008000]<BB>我打算去爬山[/color]\n[color=silver]21:55:38[/color][color=#ffa500]<Eva>听起来不错，我可能会去海边[/color]\n[color=silver]21:56:27[/color][color=#008000]<BB>海边也很棒，记得带防晒霜[/color]\n[color=silver]21:57:10[/color][color=#ffa500]<Eva>当然，我已经准备好了[/color]\n[color=silver]21:57:15[/color][color=#ffa500]<Eva>周日下午出发[/color]\n[color=silver]21:59:00[/color][color=#800080]<游客2>飘过~[/color]');
  await page.getByRole('button', { name: '预览' }).click();
  await expect(page.getByRole('main')).toMatchAriaSnapshot(`- text: /\\d+:\\d+:\\d+ <艾丽丝> 今天的天气真不错，适合出去散步 \\d+:\\d+:\\d+ <BB> 是啊，我刚刚还在想要不要去公园走走 \\d+:\\d+:\\d+ <艾丽丝> 公园里有新开的花展，听说很不错 \\d+:\\d+:\\d+ <BB> 那我们一起去看看吧，顺便拍些照片 \\d+:\\d+:\\d+ <艾丽丝> 好主意！我带上相机 \\d+:\\d+:\\d+ <BB> 太好了，期待 \\d+:\\d+:\\d+ <艾丽丝> 我已经准备好了，随时可以出发 \\d+:\\d+:\\d+ <游客1> 飘过~ \\d+:\\d+:\\d+ <Eva> 你们周末有什么计划吗？ \\d+:\\d+:\\d+ <BB> 我打算去爬山 \\d+:\\d+:\\d+ <Eva> 听起来不错，我可能会去海边 \\d+:\\d+:\\d+ <BB> 海边也很棒，记得带防晒霜 \\d+:\\d+:\\d+ <Eva> 当然，我已经准备好了 \\d+:\\d+:\\d+ <Eva> 周日下午出发 \\d+:\\d+:\\d+ <游客2> 飘过~/`);
});

