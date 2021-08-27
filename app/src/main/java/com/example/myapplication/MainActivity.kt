package com.example.myapplication

import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.provider.MediaStore
import android.widget.Button
import android.widget.ImageView
import android.widget.Toast
import java.io.InputStream
import java.net.URL

class MainActivity : AppCompatActivity() {
    private val REQUEST_CODE = 0;
    lateinit var imageView:ImageView;
    var img:Bitmap? = null;
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        imageView = findViewById(R.id.imageView);
        val uploadBtn:Button = findViewById(R.id.uploadBtn);
        val searchBtn:Button = findViewById(R.id.searchBtn);
        uploadBtn.setOnClickListener {
            var intent:Intent = Intent();
            intent.setType("image/*");
            intent.setAction(Intent.ACTION_GET_CONTENT);
            startActivityForResult(intent,REQUEST_CODE);
        }
        searchBtn.setOnClickListener { 
            //서버와 연결후 결과 출력
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if(requestCode==REQUEST_CODE){
            if(resultCode== RESULT_OK){
                try{
                    if (data != null) {
                        var currentImageUrl:Uri? = data?.data
                        img = MediaStore.Images.Media.getBitmap(contentResolver,currentImageUrl)
                        imageView.setImageBitmap(img);
                    }
                }catch (e:Exception){
                    print(e.message);
                }
            }else if(resultCode== RESULT_CANCELED){
                Toast.makeText(applicationContext,"사진 선택 취소",Toast.LENGTH_SHORT).show();
            }
        }
    }
}