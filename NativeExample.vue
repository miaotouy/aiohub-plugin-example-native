<template>
  <div class="native-example-plugin">
    <el-card shadow="never" class="example-section">
      <template #header>
        <div class="card-header">
          <strong>加法计算示例</strong>
        </div>
      </template>
      <el-space alignment="center" :size="12">
        <el-input-number v-model="num1" :controls="false" placeholder="第一个数字" />
        <span>+</span>
        <el-input-number v-model="num2" :controls="false" placeholder="第二个数字" />
        <el-button type="primary" @click="calculateSum">计算</el-button>
      </el-space>
      <div v-if="sum !== null" class="result">
        结果: {{ sum }}
      </div>
    </el-card>

    <el-card shadow="never" class="example-section">
      <template #header>
        <div class="card-header">
          <strong>系统信息</strong>
        </div>
      </template>
      <el-button @click="getSystemInfo">获取系统信息</el-button>
      <div v-if="systemInfo" class="system-info">
        <p><strong>操作系统:</strong> {{ systemInfo.os }}</p>
        <p><strong>架构:</strong> {{ systemInfo.arch }}</p>
        <p><strong>插件版本:</strong> {{ systemInfo.plugin_version }}</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { pluginManager } from '@/services/plugin-manager';

const num1 = ref(0);
const num2 = ref(0);
const sum = ref(null);
const systemInfo = ref(null);

// 获取插件实例
const plugin = pluginManager.getPlugin('native-example-dev');

const calculateSum = async () => {
  try {
    const result = await plugin.add({ a: num1.value, b: num2.value });
    sum.value = result.sum;
  } catch (error) {
    console.error('计算失败:', error);
    sum.value = '计算失败';
  }
};

const getSystemInfo = async () => {
  try {
    const info = await plugin.getSystemInfo();
    systemInfo.value = info;
  } catch (error) {
    console.error('获取系统信息失败:', error);
    systemInfo.value = { error: '获取失败' };
  }
};
</script>

<style scoped>
.native-example-plugin {
  padding: 20px;
  background-color: var(--bg-color);
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.example-section {
  --el-card-bg-color: var(--container-bg);
  border: 1px solid var(--border-color);
}

.result,
.system-info {
  margin-top: 15px;
  padding: 10px 15px;
  background-color: var(--card-bg);
  border-radius: 4px;
  border: 1px solid var(--border-color-light);
}

.system-info p {
  margin: 5px 0;
}
</style>