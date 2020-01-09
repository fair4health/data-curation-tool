<template>
  <div class="q-ma-md">
    <div class="spinner-comp flex flex-center"></div>
  </div>
</template>

<style lang="stylus">
  .spinner-comp
    height 50px
    opacity 1
  .spinner-comp:before
    content ''
    width 45px
    height 45px
    box-sizing border-box
    position absolute
    border-radius 50%
    border-top 5px solid #d8d8d8
    border-right 5px solid transparent
    animation spinner .6s linear infinite
  @keyframes spinner-comp
    to
      transform rotate(360deg)
</style>
