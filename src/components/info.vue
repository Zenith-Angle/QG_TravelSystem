<template>
  <div v-if="visible" id="info"
       style="position:absolute; z-index: 100;">
    <el-card id="box-card">
      <div slot="header" class="clearfix" style="width: 100%;">
        <span class="header-title">青甘大环线智能旅游服务系统</span>
      </div>
      <div>
        <p>这是一个基于ArcGIS Map SDK for
          JavaScript的WebGIS项目。目的是建立一个以青甘大环线为主要区域的旅游规划应用</p>
        <div class="author-info">
          <el-image
              style="width: 50px; height: 50px; border-radius: 50%;"
              src="author_avatar_url.jpg"
              fit="cover">
          </el-image>
          <a href="https://github.com/Zenith-Angle/QG_TravelSystem" target="_blank">
            <img src="@/assets/images/github.svg" alt="GitHub"
                 style="width: 50px; height: 50px;">
          </a>
        </div>
      </div>
      <!-- Close Button -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeCard">关闭</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import {ref} from 'vue';


export default {
  props: {
    visible: Boolean
  },
  methods: {
    closeCard() {
      this.$emit('update:visible', false); // 向父组件发送事件以更新visible状态
    }
  }
}
</script>

<style scoped>
#info {
  top: 120px;
  right: 30%;
}

#box-card {
  width: 600px;
  height: 400px;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border-radius: 20px;
}

.author-info {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-title {
  text-align: center;
  font-size: 1.5em;
  font-weight: bold;
}

.dialog-footer {
  text-align: center;
  margin-top: 20px;
}
</style>
