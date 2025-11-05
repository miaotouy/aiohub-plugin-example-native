<template>
  <div class="native-example-plugin">
    <h2>原生示例插件</h2>
    <p>这是一个展示原生插件能力的示例插件</p>
    
    <div class="example-section">
      <h3>加法计算示例</h3>
      <div class="input-group">
        <input v-model.number="num1" type="number" placeholder="第一个数字" />
        <span>+</span>
        <input v-model.number="num2" type="number" placeholder="第二个数字" />
        <button @click="calculateSum">计算</button>
      </div>
      <div v-if="sum !== null" class="result">
        结果: {{ sum }}
      </div>
    </div>
    
    <div class="example-section">
      <h3>系统信息</h3>
      <button @click="getSystemInfo">获取系统信息</button>
      <div v-if="systemInfo" class="system-info">
        <p><strong>操作系统:</strong> {{ systemInfo.os }}</p>
        <p><strong>架构:</strong> {{ systemInfo.arch }}</p>
        <p><strong>插件版本:</strong> {{ systemInfo.plugin_version }}</p>
      </div>
    </div>
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
  max-width: 600px;
  margin: 0 auto;
}

.example-section {
  margin-bottom: 30px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.input-group input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100px;
}

.input-group button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.input-group button:hover {
  background-color: #45a049;
}

.result {
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-weight: bold;
}

.system-info {
  margin-top: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.system-info p {
  margin: 5px 0;
}
</style>