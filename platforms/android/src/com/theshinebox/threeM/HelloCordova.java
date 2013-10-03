package com.theshinebox.threeM;

import android.os.Bundle;
import org.apache.cordova.*;

import java.io.*;

public class HelloCordova extends DroidGap

{
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
/*        try
        {
            String pName = this.getClass().getPackage().getName();
            this.copy("Databases.db","/data/data/"+pName+"/app_database/");
            this.copy("0000000000000001.db","/data/data/"+pName+"/app_database/file__0/");
        }
        catch (IOException e)
        {
            e.printStackTrace();
        }*/

        super.onCreate(savedInstanceState);
        // Set by <content src="index.html" /> in config.xml
        super.loadUrl(Config.getStartUrl());
        //super.loadUrl("file:///android_asset/www/index.html")
    }

    void copy(String file, String folder) throws IOException
    {
        File CheckDirectory;
        CheckDirectory = new File(folder);
        if (!CheckDirectory.exists())
        {
            CheckDirectory.mkdir();
        }

        InputStream in = getApplicationContext().getAssets().open(file);
        OutputStream out = new FileOutputStream(folder+file);

        // Transfer bytes from in to out
        byte[] buf = new byte[1024];
        int len; while ((len = in.read(buf)) > 0) out.write(buf, 0, len);
        in.close(); out.close();
    }
}

